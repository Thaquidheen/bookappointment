
from django.urls import path
from .views import available_slots, book_appointment

urlpatterns = [
    path('available-slots/', available_slots, name='available_slots'),
    path('book/', book_appointment, name='book_appointment'),
]
