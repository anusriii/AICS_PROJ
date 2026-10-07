from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hashing():
    raw = "btech-secret-123"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_jwt_token_lifecycle():
    data = {"sub": "42", "email": "candidate@example.com"}
    token = create_access_token(data)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "42"
    assert decoded["email"] == "candidate@example.com"


def test_invalid_jwt_token():
    invalid_token = "invalid.token.payload"
    decoded = decode_access_token(invalid_token)
    assert decoded is None
