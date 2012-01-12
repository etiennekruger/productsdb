from django.db import models

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
