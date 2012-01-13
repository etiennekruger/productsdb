from django.db import models
from utils import persistence_id

# Define models to be exported using the sync interface.
from infohub.models import *

EXPORT_MODELS = (Formulation,
                 Country,
                 Incoterm,
                 Manufacturer,
                 Supplier,
                 Price,
                 ExchangeRate,
                 MSHPrice,
                 Product,
                 ProductRegistration,)

class Deleted(models.Model):
    app = models.CharField(max_length=32)
    model = models.CharField(max_length=32)
    persistence_id = models.CharField(max_length=32)
    last_modified = models.DateTimeField(auto_now=True)

def register_deleted(sender, **kwargs):
    if sender in EXPORT_MODELS:
        instance = kwargs['instance']
        deleted = Deleted()
        deleted.app = instance._meta.app_label
        deleted.model = instance._meta.object_name
        deleted.persistence_id = persistence_id(instance)
        deleted.save()
models.signals.post_delete.connect(register_deleted, dispatch_uid="sync_deleted")
