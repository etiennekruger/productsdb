import time
from datetime import datetime
from django.db.models import get_model
from django.core.serializers import serialize
from django.http import HttpResponse, Http404
from django.utils import simplejson

from models import EXPORT_MODELS

def timestamp(request):
    timestamp = int(time.time())
    response = { 'timestamp': timestamp }
    return HttpResponse(simplejson.dumps(response), mimetype='application/json')

def model(request, app, model):
    model = get_model(app, model)
    since = request.GET.get('since', None)
    if since:
        since = datetime.fromtimestamp(int(since))
    if model in EXPORT_MODELS:
        fields = [field.name for field in model._meta.fields]
        if since and 'last_modified' in fields:
            queryset = model.objects.filter(last_modified__gt=since)
        else:
            queryset = model.objects.all()
        response = serialize('json', queryset)
        return HttpResponse(response, mimetype='application/json')
    raise Http404

def list(request):
    response = []
    for model in EXPORT_MODELS:
        response.append([model._meta.app_label, model._meta.object_name.lower()])
    return HttpResponse(simplejson.dumps(response), mimetype='application/json')    

def all(request):
    timestamp = int(time.time())
    response = { 'timestamp': timestamp }
    response = simplejson.dumps(response)
    since = request.GET.get('since', None)
    if since:
        since = datetime.fromtimestamp(int(since))
    for model in EXPORT_MODELS:
        fields = [field.name for field in model._meta.fields]
        if since and 'last_modified' in fields:
            queryset = model.objects.filter(last_modified__gt=since)
        else:
            queryset = model.objects.all()
        if queryset.count() > 0:
            response += serialize('json', queryset)
    return HttpResponse(response, mimetype='application/json')
