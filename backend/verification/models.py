from django.db import models

from commons.models import BaseModel
from places.models import Candidate
from users.models import User
from django.utils.translation import gettext_lazy as _

"""
A verification to qualify a `Candidate` as a `Spot`
"""
class Verification(BaseModel):

    class Actions(models.TextChoices):
        APPROVE = "approve", _("Approve")
        REJECT = "reject", _("Reject")
        MERGE = "merge", _("Merge")
        EDIT = "edit", _("Edit")

    candidate   = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name="verifications")
    action      = models.CharField(choices= Actions.choices, max_length=10)
    notes       = models.TextField(blank=True)
    by_user  = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)


