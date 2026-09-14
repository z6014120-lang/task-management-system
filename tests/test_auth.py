def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "email": "testuser@example.com", "password": "password123"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "testuser@example.com"
    assert "id" in data

def test_login_user(client):
    client.post(
        "/auth/register",
        json={"username": "testuser", "email": "testuser@example.com", "password": "password123"}
    )
    
    response = client.post(
        "/auth/login",
        data={"username": "testuser", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
