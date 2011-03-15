# functions just for this project
import os
import getpass
import subprocess

import tasklib

# this is the svn repository that holds private fixtures
fixtures_repo = "https://svn.aptivate.org/svn/reactionsarpam/data/fixtures/"

def deploy(environment):
    tasklib.create_ve()
    tasklib.link_local_settings(environment)
    tasklib.update_db()
    checkout_or_update_fixtures()
    load_fixtures()

def checkout_or_update_fixtures(svnuser=None, svnpass=None):
    """ checkout the fixtures from subversion """
    if svnuser == None:
        # ask the user for svn username and password
        svnuser = raw_input('Enter SVN username:')
    if svnpass == None:
        svnpass = getpass.getpass('Enter SVN password:')

    fixtures_dir = os.path.join(tasklib.env['django_dir'], "fixtures")

    # if the .svn directory exists, do an update, otherwise do
    # a checkout
    if os.path.exists(os.path.join(fixtures_dir, ".svn")):
        cmd = ['svn', 'update', '--username', svnuser, '--password', svnpass]
        subprocess.call(cmd, cwd=fixtures_dir)
    else:
        cmd = ['svn', 'checkout', '--username', svnuser, '--password', svnpass, fixtures_repo]
        subprocess.call(cmd, cwd=tasklib.env['django_dir'])


def load_fixtures():
    tasklib._manage_py(['loaddata', 'fixtures/initial_data/*.json'])
