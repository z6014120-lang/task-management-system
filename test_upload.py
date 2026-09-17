import requests
import json

res = requests.post('http://127.0.0.1:8000/auth/login', data={'username': 'admin', 'password': 'admin123'})
token = res.json()['access_token']

with open('dummy.txt', 'rb') as f:
    files = {'file': f}
    headers = {'Authorization': 'Bearer ' + token}
    res2 = requests.post('http://127.0.0.1:8000/tasks/1/upload', headers=headers, files=files)
    print(res2.status_code)
    print(res2.text)
