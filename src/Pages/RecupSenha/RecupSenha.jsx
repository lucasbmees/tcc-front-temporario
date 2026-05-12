import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RecupSenha.module.css';
import logo from '../../assets/logo.png'; // Verifique se o caminho da logo está correto

function RecupSenha() {
  const navigate = useNavigate();

  const handleRecuperar = (e) => {
    e.preventDefault();
    alert('Email de recuperação enviado!');
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>Recuperar Senha</h1>
          <p className={styles.subtitle}>
            Insira seu e-mail para receber as instruções de redefinição.
          </p>
        </div>

        <form onSubmit={handleRecuperar}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="Ex: seuemail@dominio.com"
              required 
            />
          </div>

          <button type="submit" className={styles.button}>
            Enviar Link de Recuperação
          </button>
        </form>

        <div className={styles.linkArea}>
          <Link to="/login" className={styles.link}>
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RecupSenha;