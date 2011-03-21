"""
This file demonstrates two different styles of tests (one doctest and one
unittest). These will both pass when you run "manage.py test".

Replace these with more appropriate tests for your application.
"""

from django.test import TestCase
from django.contrib.auth.models import User
from sarpaminfohub.contactlist.models import Contact

class SimpleTest(TestCase):
    login_user = None
    def login(self, client):
        if self.login_user is None:
            self.login_user = User.objects.create_user(
                            'admin',
                            'rimawebsites-team@aptivate.org',
                            password='aptivate'
                        )
            self.assertTrue(client.login(
                            username='admin',
                            password='aptivate'))
    def setUp(self):
        self.createContacts()
    
    def createContacts(self):
        c = Contact(given_name="My", family_name="Name", phone="(12345) 678910",
                   email="a@b.c", address_line_1="123 A Road Name, Somewhere", 
                   role="Head of Surgery", organization="London Teaching Hospital",
                   note="Note Very Important")
        c.save()
        c = Contact(
                   given_name="Anew", family_name="Person", phone="(54321) 123456",
                   email="d@e.f", address_line_1="456 A Road, Through the Looking Glass",
                   role="Pharmacist", organization="Selby's Pharmacy"
                   )
        c.save()
        c = Contact(given_name="Aptivate", family_name="Employee", phone="(32543) 523566",
                   email="g@h.i", address_line_1="999 Letsbe Avenue", note="Death Note",
                   role="Researcher", organization="Imperial College"
                   )
        c.save()
    
    def test_search_by_given_name(self):
        client = self.client
        self.login(client)
        response = client.post('/contacts/', {'search_term':"My"})
        self.assertContains(response, 'My Name')
    
    def test_search_by_family_name(self):
        client = self.client
        self.login(client)
        response = client.post('/contacts/', {'search_term':"Person"})
        self.assertContains(response, 'Anew Person')
    
    def test_search_by_note_for_name(self):
        client = self.client
        self.login(client)
        
        response = client.get('/search/', {'q':"Note Very Important"})
        self.assertContains(response, 'My Name')
    
    def test_search_has_note(self):
        client = self.client
        self.login(client)
        response = client.get('/search/', {'q':"Note"})
        self.assertContains(response, 'My Name')
        self.assertContains(response, 'Aptivate Employee')
        self.assertNotContains(response, 'Anew Person')
        
    def test_search_test_text(self):
        client = self.client
        self.login(client)
        response = client.get('/search/', {'q':""})
        self.assertContains(response, 'Search for a contact by Given Name, '
            +'Family Name, Email Address, Phone Number, Address '
            +'or the content of notes made about them.')
    
    def test_search_for_role(self):
        client = self.client
        self.login(client)
        response = client.get('/search/', {'q':"Head of Surgery"})
        self.assertContains(response, 'My Name')
        self.assertNotContains(response, 'Aptivate Employee')
        self.assertNotContains(response, 'Anew Person')
    
    def test_search_for_organization(self):
        client = self.client
        self.login(client)
        response = client.get('/search/', {'q':"London Teaching Hospital"})
        self.assertContains(response, 'My Name')
        self.assertNotContains(response, 'Aptivate Employee')
        self.assertNotContains(response, 'Anew Person')
    
    def test_search_for_name_has_role(self):
        client = self.client
        self.login(client)
        response = client.get('/search/', {'q':"My Name"})
        self.assertContains(response, "Head of Surgery")
        self.assertNotContains(response, "Pharmacist")
        self.assertNotContains(response, "Researcher")
    
    def test_search_for_name_has_organization(self):
        client = self.client
        self.login(client)
        response = client.get('/search/', {'q':"My Name"})
        self.assertContains(response, "Head of Surgery")
        self.assertNotContains(response, "Selby's Pharmacy")
        self.assertNotContains(response, "Imperial College")
    
    def test_no_results(self):
        client = self.client
        self.login(client)
        response = client.get('/search/', {'q':"Invalid String"})
        self.assertContains(response, 'No Results found.')
