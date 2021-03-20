class MockResponse:
    def __init__(self, json_data, status_code=200):
        self.json_data = json_data
        self.status_code = status_code
        self.ok = True if status_code // 100 == 2 else False

    def json(self):
        return self.json_data

    def raise_for_status(self):
        pass
