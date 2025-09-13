import uuid
from typing import ClassVar

from django.db import models

# Create your models here.
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_at = models.DateTimeField(auto_now=True, null=True)
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    objects: ClassVar[models.Manager["Verification"]] = models.Manager()

    # objects = models.Manager()

    class Meta:
        abstract = True
