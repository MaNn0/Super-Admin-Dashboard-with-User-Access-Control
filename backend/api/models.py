from django.db import models
from django.contrib.auth.models import User

class UserPagePermission(models.Model):
    PAGE_CHOICES = [
        ('products_list', 'Products List'),
        ('marketing_list', 'Marketing List'),
        ('order_list', 'Order List'),
        ('media_plans', 'Media Plans'),
        ('offer_pricing_skus', 'Offer Pricing SKUs'),
        ('clients', 'Clients'),
        ('suppliers', 'Suppliers'),
        ('customer_support', 'Customer Support'),
        ('sales_reports', 'Sales Reports'),
        ('finance_accounting', 'Finance & Accounting'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='page_permissions')
    page = models.CharField(max_length=50, choices=PAGE_CHOICES)
    can_view = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=False)
    can_create = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'page')  # One permission set per user per page

    def __str__(self):
        return f"{self.user.username} - {self.page}"