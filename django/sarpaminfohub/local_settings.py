import os

from settings import settings_dir

DATABASE_ENGINE = 'sqlite3'
DATABASE_NAME = os.path.join(settings_dir, 'sarpaminfohub.sqlite')
DATABASE_OPTIONS = {} # remove mysql-specific database options
DATABASE_USER = 'sarpaminfohub'
DATABASE_PASSWORD = 'sarpaminfohub'