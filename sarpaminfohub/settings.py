# Django settings for sarpaminfohub project.

import os

settings_dir = os.path.abspath(os.path.dirname(__file__))

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)

MANAGERS = ADMINS

DATABASE_ENGINE = ''           # 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
DATABASE_NAME = ''             # Or path to database file if using sqlite3.
DATABASE_USER = ''             # Not used with sqlite3.
DATABASE_PASSWORD = ''         # Not used with sqlite3.
DATABASE_HOST = ''             # Set to empty string for localhost. Not used with sqlite3.
DATABASE_PORT = ''             # Set to empty string for default. Not used with sqlite3.

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = os.path.join(settings_dir, 'media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = ''

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/media/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'i6&2c0#+kh&wiep1#58al8y+%h3xcm7!$n%np@%p2c8hc^0m#7'

# Haystack search options
HAYSTACK_SITECONF = 'sarpaminfohub.search_sites'
HAYSTACK_SEARCH_ENGINE = 'whoosh'
HAYSTACK_WHOOSH_PATH = os.path.join(settings_dir, 'search_index')

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.load_template_source',
    'django.template.loaders.app_directories.load_template_source',
#     'django.template.loaders.eggs.load_template_source',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
)

ROOT_URLCONF = 'sarpaminfohub.urls'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(settings_dir, 'templates')
)

# The list of directories to search for fixtures - overrides Django's global_settings.py
FIXTURE_DIRS = (
    os.path.join(settings_dir, 'fixtures', 'initial_data'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'django_tables',
    'haystack',
    'sarpaminfohub.contactlist',
    'sarpaminfohub.infohub',
    'tagging',
    'sarpaminfohub.sync',
)

TEMPLATE_CONTEXT_PROCESSORS = ('django.contrib.auth.context_processors.auth',
                               'django.core.context_processors.debug',
                               'django.core.context_processors.i18n',
                               'django.core.context_processors.media',
                               'django.contrib.messages.context_processors.messages',
                               'django.core.context_processors.request',
                               'sarpaminfohub.infohub.context.extra_number_settings_context'
                               )

LINKED_IN_API_KEY = "jFIwE5opBJM3bKpQbAYtCkYUZrEq4djATVmqXhr3Qph81qz8rLkN0M-fFY0vcys7"
LINKED_IN_SECRET_KEY = "sFVDxOJq9k75YYgvzad2bjaqpMsdKQTrW_-PsZljQS-hux1ecdC57OhWTgi4intB"

CACHE_BACKEND = 'db://sarpam_cache_table'

SARPAM_NUMBER_ROUNDING = 3 
SARPAM_NUMBER_FORMAT = ".0%df"%SARPAM_NUMBER_ROUNDING
SARPAM_CURRENCY_CODE = "USD"

# pylint: disable-msg=W0401
# pylint: disable-msg=W0614
from local_settings import * #@UnusedWildImport
