document.addEventListener('DOMContentLoaded', function() {
    // Check user role from localStorage (set during login)
    const userRole = localStorage.getItem('userRole');
    const isPresident = userRole === 'president';

    // Show admin controls if user is president
    const adminControls = document.getElementById('adminControls');
    if (isPresident) {
        adminControls.style.display = 'block';
    }

    // Initialize variables
    const modal = document.getElementById('eventModal');
    const addEventBtn = document.getElementById('addEventBtn');
    const closeBtn = document.querySelector('.close');
    const eventForm = document.getElementById('eventForm');
    const eventsGrid = document.getElementById('eventsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Helper function to format time to 12-hour format
    function formatTime(time) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    // Initialize Calendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            const events = getAllEvents();
            const recurringEvents = generateRecurringEvents(fetchInfo.start, fetchInfo.end);
            const allEvents = [...events, ...recurringEvents].map(event => ({
                ...event,
                allDay: false
            }));
            successCallback(allEvents);
        }
    });
    calendar.render();

    // Function to generate recurring events
    function generateRecurringEvents(start, end) {
        const events = [];
        const startDate = new Date(start);
        const endDate = new Date('2025-05-31'); // Updated to 2025
        
        // Generate Tuesday meetings
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (currentDate.getDay() === 2) { // Tuesday is 2
                const eventDate = currentDate.toISOString().split('T')[0];
                events.push({
                    id: `tuesday-${eventDate}`,
                    title: 'Weekly General Meeting',
                    start: `${eventDate}T15:00:00`,
                    end: `${eventDate}T17:00:00`,
                    category: 'meetings',
                    backgroundColor: '#1565c0',
                    description: 'Weekly SHPE general body meeting.',
                    location: 'MDC Hialeah/Kendall Campus',
                    allDay: false
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Generate 15th of month meetings
        currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (currentDate.getDate() === 15) {
                const eventDate = currentDate.toISOString().split('T')[0];
                events.push({
                    id: `monthly-${eventDate}`,
                    title: 'Monthly Executive Board Meeting',
                    start: `${eventDate}T18:00:00`,
                    end: `${eventDate}T19:00:00`,
                    category: 'meetings',
                    backgroundColor: '#1565c0',
                    description: 'Monthly executive board meeting via Zoom.',
                    location: 'Zoom',
                    allDay: false
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return events;
    }

    // Function to get all regular (non-recurring) events
    function getAllEvents() {
        const eventCards = document.querySelectorAll('.event-card');
        return Array.from(eventCards).map(card => {
            const date = card.getAttribute('data-date');
            const time = card.getAttribute('data-time');
            return {
                id: card.getAttribute('data-id'),
                title: card.querySelector('h3').textContent,
                start: `${date}T${time}`,
                end: `${date}T${time}`,
                category: card.getAttribute('data-category'),
                backgroundColor: getCategoryColor(card.getAttribute('data-category')),
                allDay: false
            };
        });
    }

    // Get color for event category
    function getCategoryColor(category) {
        const colors = {
            meetings: '#1565c0',
            workshops: '#2e7d32',
            social: '#c2185b'
        };
        return colors[category] || '#1565c0';
    }

        // Load initial events (non-recurring special events)
        const initialEvents = [
            {
                title: '8th Annual Student Interdisciplinary Symposium',
                category: 'meetings',
                date: '2024-04-02',
                time: '09:30',
                location: 'MDC Hialeah Campus, Room 5101',
                description: 'Join us for the 2024 Student Interdisciplinary Symposium featuring student projects and research presentations from all academic disciplines.'
            },
            {
                title: 'Weekly General Meeting',
                category: 'meetings',
                date: '2024-02-06',
                time: '15:00',
                location: 'MDC Hialeah/Kendall Campus (Contact officers for specific location)',
                description: 'Weekly SHPE general body meeting. Please reach out to officers or president for specific campus location.',
                recurring: 'weekly-tuesday'
            },
            {
                title: 'Monthly Virtual Board Meeting',
                category: 'meetings',
                date: '2024-02-15',
                time: '18:00',
                location: 'Zoom (Link available on first page)',
                description: 'Monthly executive board meeting via Zoom. Link available on the first page.',
                recurring: 'monthly-15th'
            }
        ];
    
        // Create event cards for initial events
        initialEvents.forEach(event => createEventCard(event));
    
        // Filter functionality
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                const cards = document.querySelectorAll('.event-card');
                
                cards.forEach(card => {
                    if (filter === 'all' || card.getAttribute('data-category') === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
    
                const visibleCards = document.querySelectorAll('.event-card[style="display: block;"]');
                const noEventsMsg = document.getElementById('noEventsMessage');
                
                if (visibleCards.length === 0) {
                    if (!noEventsMsg) {
                        const msg = document.createElement('p');
                        msg.id = 'noEventsMessage';
                        msg.className = 'no-events-message';
                        msg.textContent = `No ${filter === 'all' ? '' : filter} events currently scheduled.`;
                        eventsGrid.appendChild(msg);
                    }
                } else if (noEventsMsg) {
                    noEventsMsg.remove();
                }
            });
        });
    
        // Modal functionality (only for president)
        if (isPresident) {
            addEventBtn.addEventListener('click', () => {
                modal.style.display = 'block';
                eventForm.reset();
                document.getElementById('modalTitle').textContent = 'Add New Event';
                eventForm.removeAttribute('data-edit-id');
            });
    
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
    
            window.onclick = (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
        }
    
        // Create event card function
        function createEventCard(eventData) {
            const card = document.createElement('div');
            card.className = 'event-card';
            card.setAttribute('data-category', eventData.category);
            card.setAttribute('data-id', eventData.id || Date.now().toString());
            card.setAttribute('data-date', eventData.date);
            card.setAttribute('data-time', eventData.time);
    
            const content = `
                <div class="event-card-content">
                    <span class="event-category category-${eventData.category}">${eventData.category}</span>
                    <h3>${eventData.title}</h3>
                    <p><i class="far fa-calendar"></i> ${eventData.date}</p>
                    <p><i class="far fa-clock"></i> ${formatTime(eventData.time)}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${eventData.location}</p>
                    <p>${eventData.description}</p>
                    ${isPresident ? `
                        <div class="event-management">
                            <button class="edit-btn" onclick="editEvent('${card.getAttribute('data-id')}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="delete-btn" onclick="deleteEvent('${card.getAttribute('data-id')}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
    
            card.innerHTML = content;
            eventsGrid.appendChild(card);
    
            // Add to calendar
            calendar.addEvent({
                id: card.getAttribute('data-id'),
                title: eventData.title,
                start: `${eventData.date}T${eventData.time}`,
                end: `${eventData.date}T${eventData.time}`,
                category: eventData.category,
                backgroundColor: getCategoryColor(eventData.category),
                allDay: false
            });
    
            if (isPresident) {
                const managementDiv = card.querySelector('.event-management');
                if (managementDiv) {
                    managementDiv.style.display = 'flex';
                }
            }
        }
    
        // Form submission (only for president)
        if (isPresident) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const eventData = {
                    title: document.getElementById('eventTitle').value,
                    category: document.getElementById('eventCategory').value,
                    date: document.getElementById('eventDate').value,
                    time: document.getElementById('eventTime').value,
                    location: document.getElementById('eventLocation').value,
                    description: document.getElementById('eventDescription').value
                };
    
                const editId = eventForm.getAttribute('data-edit-id');
                if (editId) {
                    updateEvent(editId, eventData);
                } else {
                    createEventCard(eventData);
                }
    
                modal.style.display = 'none';
                eventForm.reset();
            });
        }
    
        // Edit event function
        window.editEvent = function(id) {
            const card = document.querySelector(`.event-card[data-id="${id}"]`);
            if (!card) return;
    
            const title = card.querySelector('h3').textContent;
            const category = card.getAttribute('data-category');
            const date = card.getAttribute('data-date');
            const time = card.getAttribute('data-time');
            const location = card.querySelector('.fa-map-marker-alt').parentNode.textContent.trim();
            const description = card.querySelector('p:last-child').textContent;
    
            document.getElementById('eventTitle').value = title;
            document.getElementById('eventCategory').value = category;
            document.getElementById('eventDate').value = date;
            document.getElementById('eventTime').value = time;
            document.getElementById('eventLocation').value = location;
            document.getElementById('eventDescription').value = description;
    
            document.getElementById('modalTitle').textContent = 'Edit Event';
            eventForm.setAttribute('data-edit-id', id);
            modal.style.display = 'block';
        };
    
        // Delete event function
        window.deleteEvent = function(id) {
            if (confirm('Are you sure you want to delete this event?')) {
                const card = document.querySelector(`.event-card[data-id="${id}"]`);
                if (card) {
                    card.remove();
                    const event = calendar.getEventById(id);
                    if (event) {
                        event.remove();
                    }
                }
            }
        };
    
        // Update event function
        function updateEvent(id, eventData) {
            const card = document.querySelector(`.event-card[data-id="${id}"]`);
            if (!card) return;
    
            card.setAttribute('data-category', eventData.category);
            card.setAttribute('data-date', eventData.date);
            card.setAttribute('data-time', eventData.time);
    
            const content = `
                <div class="event-card-content">
                    <span class="event-category category-${eventData.category}">${eventData.category}</span>
                    <h3>${eventData.title}</h3>
                    <p><i class="far fa-calendar"></i> ${eventData.date}</p>
                    <p><i class="far fa-clock"></i> ${formatTime(eventData.time)}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${eventData.location}</p>
                    <p>${eventData.description}</p>
                    <div class="event-management">
                        <button class="edit-btn" onclick="editEvent('${id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="deleteEvent('${id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
    
            card.innerHTML = content;
    
            const calendarEvent = calendar.getEventById(id);
            if (calendarEvent) {
                calendarEvent.remove();
            }
            calendar.addEvent({
                id: id,
                title: eventData.title,
                start: `${eventData.date}T${eventData.time}`,
                end: `${eventData.date}T${eventData.time}`,
                category: eventData.category,
                backgroundColor: getCategoryColor(eventData.category),
                allDay: false
            });
        }
    
        // Add CSS for no events message
        const style = document.createElement('style');
        style.textContent = `
            .no-events-message {
                text-align: center;
                padding: 2rem;
                color: #666;
                font-style: italic;
                grid-column: 1 / -1;
            }
        `;
        document.head.appendChild(style);
    
        // Initial filter (show all events)
        document.querySelector('.filter-btn[data-filter="all"]').click();
    });

    function menuMobile() {    /* show/hide the menu */
        let link = document.getElementById("mobile-nav-links");
        if (link.style.display === "block") {
            link.style.display = "none";
        } else {
            link.style.display = "block";
        }
    }
    

    
    