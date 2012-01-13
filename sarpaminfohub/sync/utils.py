import time
import hashlib
from datetime import datetime

__all__ = ['to_epoch', 'from_epoch', 'persistence_id']

def to_epoch(datetime=None):
    if datetime:
        return int(time.mktime(datetime.timetuple())*1000)
    return int(time.time()*1000)

def from_epoch(timestamp):
    return datetime.fromtimestamp(int(timestamp)/1000.0)

def persistence_id(instance):
    # Create database wide unique identifier for persistence.js.
    sha = hashlib.sha256()
    sha.update(instance._meta.app_label)
    sha.update(instance._meta.object_name)
    sha.update(str(instance.pk))
    return sha.hexdigest()
