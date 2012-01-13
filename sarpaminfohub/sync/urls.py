from django.conf.urls.defaults import patterns, url, include
from django.conf import settings

urlpatterns = patterns('sarpaminfohub.sync.views',
    url(r'timestamp/$', 'timestamp', name='sync_timestamp'),
    url(r'(?P<app>\w+)/(?P<model>\w+)/$', 'model', name='sync_model'),
    url(r'list/$', 'list', name='sync_list'),
)
