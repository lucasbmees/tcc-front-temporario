import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, LogOut, Menu, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import styles from './Navbar.module.css';
import logo from '../assets/logo.png';

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]       = useState(false);
  const [notificacoes, setNotificacoes]           = useState([]);
  const [propostasNtf, setPropostasNtf]           = useState([]);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  const fetchTudo = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const [resNtf, resPrpEnviadas] = await Promise.allSettled([
      fetch('/api/notificacoes/minhas', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('/api/propostas/minhas',    { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    if (resNtf.status === 'fulfilled' && resNtf.value.ok) {
      const raw = await resNtf.value.json();
      const normalizado = raw.map(n => ({
        ntfId:      n.NtfId      ?? n.ntfId,
        tipoId:     n.TipoId     ?? n.tipoId,
        tipoNome:   n.TipoNome   ?? n.tipoNome,
        mensagem:   n.Mensagem   ?? n.mensagem   ?? '(sem mensagem)',
        lida:       n.Lida       ?? n.lida        ?? false,
        createDate: n.CreateDate ?? n.createDate,
      }));
      setNotificacoes(normalizado);
    }

    const notifExtras = [];
    if (resPrpEnviadas.status === 'fulfilled' && resPrpEnviadas.value.ok) {
      const enviadas = await resPrpEnviadas.value.json();
      enviadas.forEach(p => {
        const prpId   = p.PrpId      ?? p.prpId;
        const ideiaId = p.PrpIdeiaId ?? p.prpIdeiaId;
        const infos   = p.Infos      ?? p.infos ?? [];
        const ultimo  = infos[infos.length - 1] ?? {};
        const aceite  = (ultimo.AceiteNome ?? ultimo.aceiteNome ?? '').toLowerCase();
        const retorno = ultimo.Retorno ?? ultimo.retorno;

        // Contraproposta: pendente MAS com retorno preenchido
        if (aceite === 'pendente' && retorno) {
          notifExtras.push({
            _tipo:      'contraproposta',
            ntfId:      `prp-counter-${prpId}`,
            prpId,
            prpIdeiaId: ideiaId,
            mensagem:   `O empreendedor fez uma contraproposta na ideia #${ideiaId}!`,
            lida:       false,
            createDate: ultimo.CreateDate ?? ultimo.createDate,
          });
        }
        // Proposta respondida (aceita ou recusada)
        else if (aceite && aceite !== 'pendente') {
          notifExtras.push({
            _tipo:      'proposta-respondida',
            ntfId:      `prp-env-${prpId}`,
            prpIdeiaId: ideiaId,
            mensagem:   `Sua proposta para a ideia #${ideiaId} foi ${aceite}.`,
            lida:       false,
            createDate: ultimo.CreateDate ?? ultimo.createDate,
          });
        }
      });
    }

    setPropostasNtf(notifExtras);
  }, []);

  useEffect(() => {
    fetchTudo();
    const interval = setInterval(fetchTudo, 30000);
    return () => clearInterval(interval);
  }, [fetchTudo]);

  const todasNtf = [
    ...notificacoes.map(n => ({ ...n, _tipo: 'notificacao' })),
    ...propostasNtf,
  ];

  const temNaoLidas = todasNtf.some(n => !n.lida);

  const handleNotificationClick = async (notificacao) => {
    const token = getToken();
    setShowNotifications(false);

    // Contraproposta → leva o investidor para ver e responder
    if (notificacao._tipo === 'contraproposta') {
      navigate('/minhas-propostas');
      return;
    }

    // Proposta respondida → leva para a ideia
    if (notificacao._tipo === 'proposta-respondida') {
      navigate('/minhas-propostas');
      return;
    }

    // Notificação real do banco (empreendedor recebeu proposta)
    try {
      if (notificacao.ntfId) {
        fetch(`/api/notificacoes/${notificacao.ntfId}/lida`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          if (res.ok) {
            setNotificacoes(prev =>
              prev.map(n => n.ntfId === notificacao.ntfId ? { ...n, lida: true } : n)
            );
          }
        });
      }

      const ideiaId =
        (notificacao.mensagem ?? '').match(/ideia\s*#(\d+)/i)?.[1] ??
        (notificacao.mensagem ?? '').match(/\d+/)?.[0];

      if (ideiaId) {
        navigate(`/responder-proposta/${ideiaId}`);
      } else {
        toast.error('Não foi possível identificar a ideia desta notificação.');
      }
    } catch {
      toast.error('Erro de conexão.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { to: '/',               label: 'Home'            },
    { to: '/ideias',         label: 'Ideias'          },
    { to: '/minhas-ideias',  label: 'Minhas Ideias'   },
    { to: '/minhas-propostas', label: 'Minhas Propostas' },
    { to: '/perfil',         label: 'Meu Perfil'      },
  ];

  return (
    <nav className={styles.navbar}>
      <Toaster position="top-right" />

      <Link to="/">
        <img src={logo} alt="Logo" className={styles.logo} />
      </Link>

      {/* Menu desktop */}
      <div className={`${styles.links} ${styles.desktopOnly}`}>
        {navLinks.map(link => (
          <Link key={link.to} to={link.to} className={styles.navLink}>
            {link.label}
          </Link>
        ))}
      </div>

      <div className={styles.actions}>
        {/* Sino */}
        <div className={styles.iconWrapper}>
          <button
            className={styles.iconButton}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notificações"
          >
            <Bell size={22} />
            {temNaoLidas && <span className={styles.badge} />}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className={styles.popup}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
              >
                <div className={styles.popupHeader}>
                  <h4>Notificações</h4>
                </div>

                {todasNtf.length === 0 ? (
                  <p className={styles.emptyState}>Você não tem novas notificações no momento.</p>
                ) : (
                  <ul className={styles.notificationList}>
                    {todasNtf.map(n => (
                      <li
                        key={n.ntfId}
                        className={styles.notificationItem}
                        style={{ background: !n.lida ? '#f0f7ff' : undefined, cursor: 'pointer' }}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <p className={styles.ntfMessage}>{n.mensagem}</p>
                        {n.createDate && (
                          <span className={styles.ntfDate}>
                            {new Date(n.createDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link to="/perfil" className={styles.iconButton} aria-label="Perfil">
          <User size={22} />
        </Link>

        <button className={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={18} />
          Sair
        </button>

        <button
          className={styles.menuMobile}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className={`${styles.links} ${styles.mobileOnly}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
          >
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={styles.navLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;