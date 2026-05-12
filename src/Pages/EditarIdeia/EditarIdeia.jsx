import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast'; // Agora sendo usado
import { Rocket, Tag, PieChart, Video, FileText, ChevronLeft, Save } from 'lucide-react';
import mockData from '../../mock_data.json';
import styles from './EditarIdeia.module.css';

function EditarIdeia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ida_nome: '',
    ida_categoria_nome: '',
    ida_info_descricao: '',
    ida_info_fatia: 0,
    ida_info_link_video: ''
  });

  useEffect(() => {
    const ideia = mockData.ideias.find(i => i.ida_id === parseInt(id));
    if (ideia) {
      setFormData({
        ida_nome: ideia.ida_nome,
        ida_categoria_nome: ideia.ida_categoria_nome,
        ida_info_descricao: ideia.info.ida_info_descricao,
        ida_info_fatia: ideia.info.ida_info_fatia,
        ida_info_link_video: ideia.info.ida_info_link_video
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Simulação de salvamento com Toast
    const loadingToast = toast.loading('Salvando alterações...');
    
    setTimeout(() => {
      toast.success('Ideia atualizada com sucesso!', {
        id: loadingToast,
        icon: '🚀',
      });
      
      // Pequeno delay para o usuário ver o sucesso antes de sair
      setTimeout(() => navigate('/minhas-ideias'), 1500);
    }, 1000);
  };

  return (
    <div className={styles.page}>
      <Toaster position="top-right" reverseOrder={false} />
      <div className={styles.blob}></div>
      
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronLeft size={20} /> Voltar
          </button>
          <h1 className={styles.title}>Editar seu Pitch</h1>
          <p className={styles.subtitle}>Refine as informações para atrair novos investidores.</p>
        </header>

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}><Rocket size={14}/> Nome da Ideia</label>
            <input 
              type="text" 
              name="ida_nome" 
              className={styles.input} 
              value={formData.ida_nome} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={styles.gridFields}>
            <div className={styles.formGroup}>
              <label className={styles.label}><Tag size={14}/> Categoria</label>
              <input 
                type="text" 
                name="ida_categoria_nome" 
                className={styles.input} 
                value={formData.ida_categoria_nome} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}><PieChart size={14}/> Equity Disponível (%)</label>
              <input 
                type="number" 
                name="ida_info_fatia" 
                className={styles.input} 
                value={formData.ida_info_fatia} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><Video size={14}/> Link do Vídeo (YouTube/Vimeo)</label>
            <input 
              type="text" 
              name="ida_info_link_video" 
              className={styles.input} 
              value={formData.ida_info_link_video} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}><FileText size={14}/> Descrição do Projeto</label>
            <textarea 
              name="ida_info_descricao" 
              className={styles.textarea} 
              value={formData.ida_info_descricao} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className={styles.buttonGroup}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className={styles.btnSave}
            >
              <Save size={18} /> Salvar Alterações
            </motion.button>
            <button 
              type="button" 
              className={styles.btnCancel} 
              onClick={() => navigate('/minhas-ideias')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default EditarIdeia;