from django.db.models import get_model
from django.db.models import DecimalField, ForeignKey, OneToOneField
from django.core.serializers import serialize
from django.http import HttpResponse, Http404
from django.utils import simplejson
from django.views.decorators.csrf import csrf_exempt

from utils import *
from models import EXPORT_MODELS, Deleted

def timestamp(request):
    """ Returns the current server timestamp to a persistence.sync.js client.
    Not sure if it is usefull.
    """
    response = { 'now': to_epoch() }
    return HttpResponse(simplejson.dumps(response), mimetype='application/json')

def list(request):
    """ Returns an (app, model) pair for every model that is exported to the
    persistence.sync.js client. Not sure if it is usefull.
    """
    response = []
    for model in EXPORT_MODELS:
        response.append([model._meta.app_label, model._meta.object_name.lower()])
    return HttpResponse(simplejson.dumps(response), mimetype='application/json')    

@csrf_exempt
def model(request, app, model):
    """ Server side implementaion of the persistence.sync.js protocol for
    synchronizing a remote HTML5 database to the local database.
    """
    model = get_model(app, model)
    since = request.GET.get('since', None)
    if since:
        since = from_epoch(since)
    if model in EXPORT_MODELS:
        # Time of sync to report to client.
        timestamp = to_epoch()
        # POST requests get a fake OK response.
        if (request.method == 'POST'):
            print request.POST
            response = { 'status': 'ok', 'now': timestamp }
            return HttpResponse(simplejson.dumps(response), mimetype='application/json')
        print 'Sending all %s since %s' % (model, since)
        fields = [field.name for field in model._meta.fields]
        # Objects with no 'last_modified' will send the all() queryset.
        if since and 'last_modified' in fields:
            queryset = model.objects.filter(last_modified__gt=since)
        else:
            queryset = model.objects.all()
        updates = []
        for instance in queryset:
            update = {}
            for field in instance._meta.fields:
                # Primary key and 'id' field is mapped to 'did'. persistence.js
                # expects a database wide identifier in the 'id' field.
                if field.primary_key or (field.name == 'id'):
                    update['did'] = getattr(instance, field.name)
                if (field.name == 'last_modified'):
                    # Modify last_modified field to suit persistence.sync.js.
                    last_modified = getattr(instance, field.name)
                    update['_lastChange'] = to_epoch(last_modified)
                elif type(field) == DecimalField:
                    value = getattr(instance, field.name)
                    if value:
                        update[field.name] = float(value)
                    else:
                        update[field.name] = None
                elif ((type(field) == ForeignKey) or
                      (type(field) == OneToOneField)):
                    foreign = getattr(instance, field.name)
                    if foreign:
                        update[field.name] = persistence_id(instance=foreign)
                    else:
                        update[field.name] = None
                else:
                    update[field.name] = getattr(instance, field.name)
            update['id'] = persistence_id(instance=instance)
            update['repr'] = unicode(instance).encode('ascii', 'ignore')
            updates.append(update)
        # Deleted items get added only if no 'since' given. This ensures
        # that they are ignored for initial syncs.
        if since:
            deleted = Deleted.objects.filter(app=model._meta.app_label,
                                             model=model._meta.object_name,
                                             last_modified__gt=since)
            for instance in deleted:
                last_modified = getattr(instance, field.name)
                update = { 'id': instance.persistence_id,
                           '_removed': True,
                           '_lastChange': to_epoch(last_modified) }
                updates.append(update)
        # Build the response that persistence.sync.js expects.
        response = { 'now': timestamp, 'updates': updates }
        return HttpResponse(simplejson.dumps(response, indent=2), mimetype='application/json')
    raise Http404
