def test_create_project(client):
    # Register and login first
    client.post(
        "/auth/register",
        json={"username": "projectuser", "email": "projectuser@example.com", "password": "password123"}
    )
    login_response = client.post(
        "/auth/login",
        data={"username": "projectuser", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/projects/",
        json={"name": "New Project", "description": "Test description"},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Project"
    assert "id" in data
