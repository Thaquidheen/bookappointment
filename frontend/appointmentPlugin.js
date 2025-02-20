(function(global) {
    function AppointmentPlugin(config) {
      this.apiBaseUrl = config.apiBaseUrl;
      this.container = config.container;
      this.renderUI();
    }
  
    AppointmentPlugin.prototype.renderUI = function() {
      // Plugin container
      const pluginWrapper = document.createElement('div');
      pluginWrapper.className = 'appointment-plugin';
  
      // Title
      const title = document.createElement('h3');
      title.className = 'appointment-plugin-title';
      title.textContent = 'Book an Appointment';
      pluginWrapper.appendChild(title);
  
      // --------------------------
      // 1) NAME FIELD
      // --------------------------
      const nameField = this.createField('Name:', 'text', 'apptName');
      pluginWrapper.appendChild(nameField);
      this.nameInput = nameField.querySelector('#apptName');
  
      // --------------------------
      // 2) PHONE FIELD
      // --------------------------
      const phoneField = this.createField('Phone:', 'text', 'apptPhone');
      pluginWrapper.appendChild(phoneField);
      this.phoneInput = phoneField.querySelector('#apptPhone');
  
      // --------------------------
      // 3) DATE FIELD
      // --------------------------
      const dateField = this.createField('Date:', 'date', 'apptDate');
      pluginWrapper.appendChild(dateField);
      this.dateInput = dateField.querySelector('#apptDate');
  
      // Whenever the user changes the date, automatically load slots
      this.dateInput.addEventListener('change', () => {
        this.loadAvailableSlots(this.dateInput.value, this.slotSelect);
      });
  
      // --------------------------
      // 4) TIME SLOT DROPDOWN
      // --------------------------
      const slotField = document.createElement('div');
      slotField.className = 'appointment-field';
  
      const slotLabel = document.createElement('label');
      slotLabel.className = 'appointment-label';
      slotLabel.textContent = 'Time Slot:';
  
      const slotSelect = document.createElement('select');
      slotSelect.className = 'appointment-select';
      slotSelect.id = 'apptSlot';
  
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '--Select--';
      slotSelect.appendChild(defaultOption);
  
      slotField.appendChild(slotLabel);
      slotField.appendChild(slotSelect);
      pluginWrapper.appendChild(slotField);
      this.slotSelect = slotSelect;
  
      // --------------------------
      // 5) BOOK APPOINTMENT BUTTON
      // --------------------------
      const bookBtn = document.createElement('button');
      bookBtn.textContent = 'Book Appointment';
      bookBtn.className = 'appointment-button';
      bookBtn.style.marginTop = '10px';
      bookBtn.addEventListener('click', () => {
        const nameValue = this.nameInput.value.trim();
        const phoneValue = this.phoneInput.value.trim();
        const dateValue = this.dateInput.value;
        const slotValue = this.slotSelect.value;
        this.bookAppointment(nameValue, phoneValue, dateValue, slotValue);
      });
      pluginWrapper.appendChild(bookBtn);
  
      // Finally, attach the wrapper to the container
      this.container.appendChild(pluginWrapper);
    };
  
    /**
     * Utility to create a labeled field with input
     */
    AppointmentPlugin.prototype.createField = function(labelText, inputType, inputId) {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'appointment-field';
  
      const label = document.createElement('label');
      label.className = 'appointment-label';
      label.textContent = labelText;
  
      const input = document.createElement('input');
      input.className = 'appointment-input';
      input.type = inputType;
      input.id = inputId;
  
      fieldDiv.appendChild(label);
      fieldDiv.appendChild(input);
      return fieldDiv;
    };
  
    /**
     * Fetches available slots for the given date
     */
    AppointmentPlugin.prototype.loadAvailableSlots = function(dateValue, slotSelect) {
      if (!dateValue) {
        // If date is cleared, reset the dropdown
        slotSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '--Select--';
        slotSelect.appendChild(defaultOption);
        return;
      }
  
      fetch(`${this.apiBaseUrl}/available-slots/?date=${dateValue}`)
        .then(res => {
          if (!res.ok) throw new Error('Error fetching available slots');
          return res.json();
        })
        .then(data => {
          slotSelect.innerHTML = '';
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = '--Select--';
          slotSelect.appendChild(defaultOption);
  
          data.availableSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            slotSelect.appendChild(option);
          });
        })
        .catch(err => {
          console.error(err);
          alert('Failed to load available slots.');
        });
    };
  
    /**
     * Books an appointment
     */
    AppointmentPlugin.prototype.bookAppointment = function(name, phone, dateVal, slotVal) {
      if (!name || !phone || !dateVal || !slotVal) {
        alert('Please fill out all fields.');
        return;
      }
  
      fetch(`${this.apiBaseUrl}/book/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phoneNumber: phone,
          date: dateVal,
          timeSlot: slotVal
        }),
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to book appointment');
  
          // Successfully booked
          alert(data.message);
  
          // Clear fields
          this.nameInput.value = '';
          this.phoneInput.value = '';
          this.dateInput.value = '';
  
          // Reset the slot dropdown
          this.slotSelect.innerHTML = '';
          const defaultOption = document.createElement('option');
          defaultOption.value = '';
          defaultOption.textContent = '--Select--';
          this.slotSelect.appendChild(defaultOption);
        })
        .catch(err => {
          console.error(err);
          alert(err.message);
        });
    };
  
    // Expose globally
    global.AppointmentPlugin = AppointmentPlugin;
  })(window);
  