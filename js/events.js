document.addEventListener('DOMContentLoaded', function() {
    // Initialize FullCalendar
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: 800, // Set a fixed height
        events: [
            {
                title: 'Weekly Research Meeting',
                start: '2025-01-29T15:00:00',
                end: '2025-01-29T17:00:00',
                extendedProps: {
                    location: 'Kendall Robotics Lab',
                    category: 'meetings'
                }
            },
            {
                title: 'Monthly Member Meeting',
                start: '2025-02-15T18:00:00',
                end: '2025-02-15T19:00:00',
                extendedProps: {
                    location: 'Virtual Meeting via Zoom',
                    category: 'meetings'
                }
            }
        ],
        eventDidMount: function(info) {
            // Add tooltips to events
            info.el.title = info.event.title + '\n' + 
                           info.event.extendedProps.location + '\n' + 
                           info.event.start.toLocaleTimeString();
        }
    });
    calendar.render();

    // Filter buttons functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterType = this.textContent.toLowerCase();
            const eventCards = document.querySelectorAll('.event-card');
            
            eventCards.forEach(card => {
                if (filterType === 'all events' || card.dataset.category === filterType) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
