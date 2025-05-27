const mockFiles = [
    { 
      id: 1, 
      name: 'Relatório Final.docx', 
      type: 'doc', 
      owner: 'Você', 
      lastModified: '27 de abril de 2025', 
      size: '245 KB'
    },
    { 
      id: 2, 
      name: 'Apresentação de Projeto.pptx', 
      type: 'slide', 
      owner: 'Você', 
      lastModified: '25 de abril de 2025', 
      size: '2,3 MB'
    },
    { 
      id: 3, 
      name: 'Orçamento 2025.xlsx', 
      type: 'sheet', 
      owner: 'Maria Silva', 
      lastModified: '20 de abril de 2025', 
      size: '456 KB'
    },
    { 
      id: 4, 
      name: 'Contrato.pdf', 
      type: 'pdf', 
      owner: 'Você', 
      lastModified: '15 de abril de 2025', 
      size: '1,2 MB'
    },
    { 
      id: 5, 
      name: 'Logo da Empresa.png', 
      type: 'image', 
      owner: 'Carlos Santos', 
      lastModified: '10 de abril de 2025', 
      size: '567 KB'
    },
    { 
      id: 6, 
      name: 'Dados de Clientes.xlsx', 
      type: 'sheet', 
      owner: 'Você', 
      lastModified: '8 de abril de 2025', 
      size: '789 KB'
    },
    { 
      id: 7, 
      name: 'Manual do Usuário.pdf', 
      type: 'pdf', 
      owner: 'Ana Oliveira', 
      lastModified: '5 de abril de 2025', 
      size: '3,4 MB'
    },
    { 
      id: 8, 
      name: 'Plano de Marketing.docx', 
      type: 'doc', 
      owner: 'Você', 
      lastModified: '1 de abril de 2025', 
      size: '567 KB'
    }
  ];
  

  const fileList = document.getElementById('file-list');
  const reminderModal = document.getElementById('reminder-modal');
  const reminderFileNameElement = document.getElementById('reminder-file-name');
  const reminderDateInput = document.getElementById('reminder-date');
  const reminderTimeInput = document.getElementById('reminder-time');
  const reminderNoteInput = document.getElementById('reminder-note-input');
  const saveReminderButton = document.getElementById('save-reminder');
  const cancelReminderButton = document.getElementById('cancel-reminder');
  const closeModalButtons = document.querySelectorAll('.close-modal');
  const notificationToast = document.getElementById('notification-toast');
  const toastMessage = document.querySelector('.toast-message');
  const toastClose = document.querySelector('.toast-close');
  const reminderCount = document.getElementById('reminder-count');
  const remindersMenu = document.querySelector('.reminders-menu');
  const remindersListModal = document.getElementById('reminders-list-modal');
  const remindersList = document.getElementById('reminders-list');
  

  let currentFileId = null;
  let reminders = [];
  
  
  function init() {
    loadReminders();
    renderFiles();
    updateReminderCount();
    checkForDueReminders();
    setupEventListeners();
    
    setInterval(checkForDueReminders, 60000);
  }
  

  function loadReminders() {
    const savedReminders = localStorage.getItem('fileReminders');
    if (savedReminders) {
      reminders = JSON.parse(savedReminders);
    }
  }
  

  function saveReminders() {
    localStorage.setItem('fileReminders', JSON.stringify(reminders));
    updateReminderCount();
  }
  
 
  function updateReminderCount() {
    const count = reminders.length;
    reminderCount.textContent = count > 0 ? count : '';
  }
  
 
  function renderFiles() {
    fileList.innerHTML = '';
    
    mockFiles.forEach(file => {
      const hasReminder = reminders.some(r => r.fileId === file.id);
      const row = document.createElement('tr');
      
      let fileIconClass = '';
      switch(file.type) {
        case 'doc': fileIconClass = 'fas fa-file-word doc'; break;
        case 'slide': fileIconClass = 'fas fa-file-powerpoint slide'; break;
        case 'sheet': fileIconClass = 'fas fa-file-excel sheet'; break;
        case 'pdf': fileIconClass = 'fas fa-file-pdf pdf'; break;
        case 'image': fileIconClass = 'fas fa-file-image image'; break;
        default: fileIconClass = 'fas fa-file';
      }
      
      row.innerHTML = `
        <td class="file-name">
          <div class="file-item">
            <i class="${fileIconClass} file-icon"></i>
            <span>${file.name}</span>
          </div>
        </td>
        <td>${file.owner}</td>
        <td>${file.lastModified}</td>
        <td>${file.size}</td>
        <td>
          <button class="reminder-button ${hasReminder ? 'has-reminder' : ''}" data-file-id="${file.id}">
            <i class="fas ${hasReminder ? 'fa-bell' : 'fa-bell-slash'}"></i>
            ${hasReminder ? 'Agendado' : 'Lembrete'}
          </button>
        </td>
      `;
      
      fileList.appendChild(row);
    });
  }
  
 
  function showReminderModal(fileId) {
    currentFileId = fileId;
    const file = mockFiles.find(f => f.id === fileId);
    
    if (file) {
      reminderFileNameElement.textContent = file.name;
      
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = formatDateForInput(tomorrow);
      reminderDateInput.value = dateString;
      
      
      const existingReminder = reminders.find(r => r.fileId === fileId);
      if (existingReminder) {
        const reminderDate = new Date(existingReminder.date);
        reminderDateInput.value = formatDateForInput(reminderDate);
        
        
        const hours = reminderDate.getHours().toString().padStart(2, '0');
        const minutes = reminderDate.getMinutes().toString().padStart(2, '0');
        reminderTimeInput.value = `${hours}:${minutes}`;
        
        
        reminderNoteInput.value = existingReminder.note || '';
      } else {
        reminderNoteInput.value = '';
      }
      
      reminderModal.classList.add('show');
    }
  }
  

  function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
 
  function saveReminder() {
    if (!currentFileId || !reminderDateInput.value) return;
    

    const [year, month, day] = reminderDateInput.value.split('-');
    const [hours, minutes] = reminderTimeInput.value.split(':');
    const reminderDate = new Date(year, month - 1, day, hours, minutes);
    

    const existingIndex = reminders.findIndex(r => r.fileId === currentFileId);
    
    const file = mockFiles.find(f => f.id === currentFileId);
    const reminderData = {
      fileId: currentFileId,
      fileName: file.name,
      date: reminderDate.toISOString(),
      note: reminderNoteInput.value.trim(),
      notified: false
    };
    
    if (existingIndex >= 0) {
      
      reminders[existingIndex] = reminderData;
    } else {
      
      reminders.push(reminderData);
    }
    
    saveReminders();
    closeModal(reminderModal);
    renderFiles();
    
    
    showToast(`Lembrete definido para ${formatDateForDisplay(reminderDate)}`);
  }
  
 
  function formatDateForDisplay(date) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
  }
  
 
  function closeModal(modal) {
    modal.classList.remove('show');
    currentFileId = null;
  }
  
 
  function showToast(message) {
    toastMessage.textContent = message;
    notificationToast.classList.add('show');
    
  
    setTimeout(() => {
      notificationToast.classList.remove('show');
    }, 5000);
  }
  

  function checkForDueReminders() {
    const now = new Date();
    let hasNotified = false;
    
    reminders.forEach(reminder => {
      const reminderDate = new Date(reminder.date);
      
      
      if (reminderDate <= now && !reminder.notified) {
    
        showToast(`Lembrete: ${reminder.fileName} deve ser entregue hoje!`);
        
     
        reminder.notified = true;
        hasNotified = true;
      }
    });
    

    if (hasNotified) {
      saveReminders();
    }
  }
  

  function showRemindersListModal() {
    renderRemindersList();
    remindersListModal.classList.add('show');
  }
  
 
  function renderRemindersList() {
    remindersList.innerHTML = '';
    
    if (reminders.length === 0) {
      remindersList.innerHTML = '<p class="no-reminders">Você não tem lembretes definidos.</p>';
      return;
    }
    
  
    const sortedReminders = [...reminders].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    sortedReminders.forEach(reminder => {
      const reminderDate = new Date(reminder.date);
      const isPast = reminderDate < new Date();
      
      const reminderElement = document.createElement('div');
      reminderElement.className = 'reminder-item';
      
      reminderElement.innerHTML = `
        <div class="reminder-file">${reminder.fileName}</div>
        <div class="reminder-date ${isPast ? 'past' : ''}">
          <i class="fas fa-calendar-alt"></i>
          ${formatDateForDisplay(reminderDate)}
        </div>
        ${reminder.note ? `<div class="reminder-note-text">${reminder.note}</div>` : ''}
        <div class="reminder-actions">
          <button class="reminder-delete" data-file-id="${reminder.fileId}">
            <i class="fas fa-trash"></i> Remover
          </button>
        </div>
      `;
      
      remindersList.appendChild(reminderElement);
    });
  }
  

  function deleteReminder(fileId) {
    reminders = reminders.filter(r => r.fileId !== fileId);
    saveReminders();
    renderRemindersList();
    renderFiles();
  }
  

  function setupEventListeners() {
    
    document.addEventListener('click', (e) => {
      if (e.target.closest('.reminder-button')) {
        const button = e.target.closest('.reminder-button');
        const fileId = parseInt(button.getAttribute('data-file-id'));
        showReminderModal(fileId);
      }
    });
    

    saveReminderButton.addEventListener('click', saveReminder);
    
    
    cancelReminderButton.addEventListener('click', () => {
      closeModal(reminderModal);
    });
    
    
    closeModalButtons.forEach(button => {
      button.addEventListener('click', () => {
        closeModal(button.closest('.modal'));
      });
    });
    
    
    toastClose.addEventListener('click', () => {
      notificationToast.classList.remove('show');
    });
    
    
    remindersMenu.addEventListener('click', showRemindersListModal);
    
    
    document.addEventListener('click', (e) => {
      if (e.target.closest('.reminder-delete')) {
        const button = e.target.closest('.reminder-delete');
        const fileId = parseInt(button.getAttribute('data-file-id'));
        deleteReminder(fileId);
      }
    });
    
   
    window.addEventListener('click', (e) => {
      if (e.target === reminderModal) {
        closeModal(reminderModal);
      }
      if (e.target === remindersListModal) {
        closeModal(remindersListModal);
      }
    });
    
   
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const rows = fileList.querySelectorAll('tr');
      
      rows.forEach(row => {
        const fileName = row.querySelector('.file-name span').textContent.toLowerCase();
        if (fileName.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
  

  document.addEventListener('DOMContentLoaded', init);