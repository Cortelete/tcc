import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Task, TaskCriticality, ReminderType, TaskType } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  defaultReminderType: ReminderType;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, defaultReminderType }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [frequencyHours, setFrequencyHours] = useState(24);
  const [criticality, setCriticality] = useState<TaskCriticality>(TaskCriticality.MEDIUM);
  const [reminderType, setReminderType] = useState<ReminderType>(defaultReminderType);
  const [taskType, setTaskType] = useState<TaskType>('generic');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  useEffect(() => {
    if(isOpen) {
        setReminderType(defaultReminderType);
    }
  }, [isOpen, defaultReminderType])

  const resetForm = () => {
    setName('');
    setDescription('');
    setStartTime('09:00');
    setFrequencyHours(24);
    setCriticality(TaskCriticality.MEDIUM);
    setReminderType(defaultReminderType);
    setTaskType('generic');
    setDosage('');
    setInstructions('');
    setCategory('');
    setSubcategory('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddTask({
      name,
      description,
      startTime,
      frequencyHours,
      criticality,
      reminderType,
      taskType,
      dosage: taskType === 'medication' ? dosage : undefined,
      instructions: taskType === 'medication' ? instructions : undefined,
      category: taskType === 'medication' ? category : undefined,
      subcategory: taskType === 'medication' ? subcategory : undefined,
    });
    resetForm();
  };
  
  const inputStyle = "mt-1 w-full border-gray-600/50 bg-gray-700/50 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white p-2";
  const labelStyle = "block text-sm font-medium text-white/70";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Nova Tarefa">
      <form onSubmit={handleSubmit} className="space-y-4 text-white/90">
        
        <div>
          <label htmlFor="task-type" className={labelStyle}>Tipo de Tarefa</label>
          <select id="task-type" value={taskType} onChange={e => setTaskType(e.target.value as TaskType)} className={inputStyle}>
            <option value="generic">Tarefa Geral</option>
            <option value="medication">Medicamento</option>
          </select>
        </div>

        <div>
          <label htmlFor="task-name" className={labelStyle}>
            {taskType === 'medication' ? 'Nome do Medicamento' : 'Nome da Tarefa'}
          </label>
          <input type="text" id="task-name" value={name} onChange={e => setName(e.target.value)} required className={inputStyle}/>
        </div>
        
        {taskType === 'medication' && (
            <>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="task-category" className={labelStyle}>Categoria</label>
                        <input type="text" id="task-category" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ex: Vitamina" className={inputStyle}/>
                    </div>
                     <div>
                        <label htmlFor="task-subcategory" className={labelStyle}>Subcategoria</label>
                        <input type="text" id="task-subcategory" value={subcategory} onChange={e => setSubcategory(e.target.value)} placeholder="Ex: Vitamina D" className={inputStyle}/>
                    </div>
                </div>
                <div>
                    <label htmlFor="task-dosage" className={labelStyle}>Dosagem</label>
                    <input type="text" id="task-dosage" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Ex: 1 comprimido, 5mg" className={inputStyle}/>
                </div>
                 <div>
                    <label htmlFor="task-instructions" className={labelStyle}>Instruções</label>
                    <input type="text" id="task-instructions" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Ex: Tomar com comida, de estômago vazio" className={inputStyle}/>
                </div>
            </>
        )}

        {taskType === 'generic' && (
             <div>
              <label htmlFor="task-desc" className={labelStyle}>Descrição (opcional)</label>
              <input type="text" id="task-desc" value={description} onChange={e => setDescription(e.target.value)} className={inputStyle}/>
            </div>
        )}
       
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="task-time" className={labelStyle}>Horário de Início</label>
                <input type="time" id="task-time" value={startTime} onChange={e => setStartTime(e.target.value)} required className={inputStyle}/>
            </div>
            <div>
                <label htmlFor="task-freq" className={labelStyle}>Frequência (horas)</label>
                <input type="number" id="task-freq" value={frequencyHours} onChange={e => setFrequencyHours(parseInt(e.target.value, 10))} min="1" required className={inputStyle}/>
            </div>
        </div>
        <div>
          <label htmlFor="task-reminder" className={labelStyle}>Tipo de Lembrete</label>
          <select id="task-reminder" value={reminderType} onChange={e => setReminderType(e.target.value as ReminderType)} className={inputStyle}>
            <option value="alarm">Alarme Padrão</option>
            <option value="sensitive">Alarme Sensível</option>
            <option value="loud">Alto e Insistente</option>
            <option value="call">Chamada Simulada</option>
            <option value="game">Desafio Interativo</option>
            <option value="whatsapp">Chatbot (WhatsApp)</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-crit" className={labelStyle}>Criticidade</label>
          <select id="task-crit" value={criticality} onChange={e => setCriticality(e.target.value as TaskCriticality)} className={inputStyle}>
            <option value={TaskCriticality.LOW}>Baixa</option>
            <option value={TaskCriticality.MEDIUM}>Média</option>
            <option value={TaskCriticality.HIGH}>Alta</option>
          </select>
        </div>
        <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="py-2 px-4 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white/80 bg-white/10 hover:bg-white/20">Cancelar</button>
            <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Adicionar Tarefa</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;