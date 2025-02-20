# appointments/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime

from .models import Appointment

@api_view(['GET'])
def available_slots(request):
    date_str = request.query_params.get('date')
    if not date_str:
        return Response({'error': 'date parameter (YYYY-MM-DD) is required.'}, status=400)
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)
    all_slots = generate_time_slots()
    booked_appointments = Appointment.objects.filter(date=date_obj)
    booked_slots = [appt.time_slot.strftime('%H:%M') for appt in booked_appointments]
    free_slots = [slot for slot in all_slots if slot not in booked_slots]

    return Response({'availableSlots': free_slots})

@api_view(['POST'])
def book_appointment(request):
    data = request.data
    name = data.get('name')
    phone = data.get('phoneNumber')
    date_str = data.get('date')
    time_slot_str = data.get('timeSlot')


    if not all([name, phone, date_str, time_slot_str]):
        return Response({'error': 'Missing required fields.'}, status=400)

    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)


    try:
        time_obj = datetime.strptime(time_slot_str, '%H:%M').time()
    except ValueError:
        return Response({'error': 'Invalid time format. Use HH:MM (24-hour).'}, status=400)


    if Appointment.objects.filter(date=date_obj, time_slot=time_obj).exists():
        return Response({'error': 'This slot is already booked.'}, status=409)

    appt = Appointment.objects.create(
        name=name,
        phone=phone,
        date=date_obj,
        time_slot=time_obj
    )

    return Response({
        'message': 'Appointment booked successfully',
        'appointment': {
            'id': appt.id,
            'name': appt.name,
            'phone': appt.phone,
            'date': date_str,
            'timeSlot': time_slot_str
        }
    }, status=201)

def generate_time_slots():
  
    slots = []
    for hour in range(10, 17): 
        if hour == 13:
            continue  
        hour_str = f"{hour:02d}"
        slots.append(f"{hour_str}:00")
        slots.append(f"{hour_str}:30")
    return slots
