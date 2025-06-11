from django.urls import path
from .views import (
    LoginView,
    UserListView,
    CreateUserView,
    UserPermissionsView,
    UserDeleteView,
    CommentView,
    UserMePermissionsView
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/create/', CreateUserView.as_view(), name='create-user'),
    path('users/<int:user_id>/permissions/', UserPermissionsView.as_view(), name='user-permissions'),
    path('users/<int:user_id>/delete/', UserDeleteView.as_view(), name='delete-user'),
    path('comments/', CommentView.as_view(), name='comments'),
    path('me/permissions/', UserMePermissionsView.as_view(), name='user-me-permissions'),  # New endpoint
]
