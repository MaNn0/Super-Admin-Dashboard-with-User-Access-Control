import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import UserPagePermission

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('username')  # Using 'username' key to send email
            password = data.get('password')

            user = User.objects.filter(email=email).first()
            if user and user.check_password(password):
                refresh = RefreshToken.for_user(user)

                # Get user permissions
                permissions = [
                    {
                        "page": perm.page,
                        "can_view": perm.can_view,
                        "can_edit": perm.can_edit,
                        "can_create": perm.can_create,
                        "can_delete": perm.can_delete,
                    }
                    for perm in user.page_permissions.all()
                ]

                return JsonResponse({
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "is_superuser": user.is_superuser,
                        "permissions": permissions,
                    },
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    }
                })

            return JsonResponse({"message": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


    def options(self, request):
        response = JsonResponse({"message": "OPTIONS response"})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
@method_decorator(csrf_exempt, name='dispatch')
class UserMePermissionsView(View):
    def get(self, request):
        try:
            # JWT authentication
            auth = JWTAuthentication()
            user, _ = auth.authenticate(request)
            if not user:
                return JsonResponse({"error": "Unauthorized"}, status=401)
            
            # Get user permissions
            permissions = [
                {
                    "page": perm.page,
                    "can_view": perm.can_view,
                    "can_edit": perm.can_edit,
                    "can_create": perm.can_create,
                    "can_delete": perm.can_delete,
                }
                for perm in user.page_permissions.all()
            ]
            return JsonResponse({
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_superuser": user.is_superuser,
                    "permissions": permissions,
                }
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    def options(self, request):
        response = JsonResponse({"message": "OPTIONS response"})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
    
@method_decorator(csrf_exempt, name='dispatch')
class UserListView(View):
    def get(self, request):
        try:
            # JWT authentication
            auth = JWTAuthentication()
            user, _ = auth.authenticate(request)
            if not user or not user.is_superuser:
                return JsonResponse({"error": "Unauthorized"}, status=401)
            users = User.objects.all()
            user_list = [
                {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_superuser": user.is_superuser,
                    "is_active": user.is_active,
                    "permissions": [
                        {
                            "page": perm.page,
                            "can_view": perm.can_view,
                            "can_edit": perm.can_edit,
                            "can_create": perm.can_create,
                            "can_delete": perm.can_delete
                        }
                        for perm in user.page_permissions.all()
                    ]
                }
                for user in users
            ]
            return JsonResponse({"users": user_list})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    def options(self, request):
        response = JsonResponse({"message": "OPTIONS response"})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

@method_decorator(csrf_exempt, name='dispatch')
class CreateUserView(View):
    def post(self, request):
        try:
            auth = JWTAuthentication()
            user, _ = auth.authenticate(request)
            if not user or not user.is_superuser:
                return JsonResponse({"error": "Unauthorized"}, status=401)
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            if not email or not password:
                return JsonResponse({"error": "Email and password are required"}, status=400)
            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "User with this email already exists"}, status=400)
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )
            return JsonResponse({"message": "User created successfully", "user_id": user.id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    def options(self, request):
        response = JsonResponse({"message": "OPTIONS response"})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

@method_decorator(csrf_exempt, name='dispatch')
class UserPermissionsView(View):
    def put(self, request, user_id):
        try:
            auth = JWTAuthentication()
            admin, _ = auth.authenticate(request)
            print(f"Authenticated admin: {admin}")  # Debug
            if not admin or not admin.is_superuser:
                return JsonResponse({"error": "Unauthorized"}, status=401)
            data = json.loads(request.body)
            print(f"Received data: {data}")  # Debug
            page = data.get('page')
            if not page:
                return JsonResponse({"error": "Page is required"}, status=400)
            if page not in [
                'products_list', 'marketing_list', 'order_list', 'media_plans', 'offer_pricing_skus',
                'clients', 'suppliers', 'customer_support', 'sales_reports', 'finance_accounting'
            ]:
                return JsonResponse({"error": "Invalid page"}, status=400)
            permissions = {
                'can_view': data.get('can_view', False),
                'can_edit': data.get('can_edit', False),
                'can_create': data.get('can_create', False),
                'can_delete': data.get('can_delete', False),
            }
            user = User.objects.get(id=user_id)
            UserPagePermission.objects.update_or_create(
                user=user,
                page=page,
                defaults=permissions
            )
            return JsonResponse({"message": "Permissions updated successfully"})
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            print(f"Error in UserPermissionsView: {str(e)}")  # Debug
            return JsonResponse({"error": str(e)}, status=400)

    def options(self, request, user_id=None):
        response = JsonResponse({"message": "OPTIONS response"})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'PUT, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response
        
@method_decorator(csrf_exempt, name='dispatch')
class UserDeleteView(View):
    def delete(self, request, user_id):
        try:
            auth = JWTAuthentication()
            admin, _ = auth.authenticate(request)
            if not admin or not admin.is_superuser:
                return JsonResponse({"error": "Unauthorized"}, status=401)
            user = User.objects.get(id=user_id)
            user.delete()
            return JsonResponse({"message": "User deleted successfully"})
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    def options(self, request, user_id=None):
        response = JsonResponse({"message": "OPTIONS response"})
        response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response['Access-Control-Allow-Methods'] = 'DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return response

class CommentView(View):
    def get(self, request):
        return JsonResponse({"message": "CommentView GET response"})