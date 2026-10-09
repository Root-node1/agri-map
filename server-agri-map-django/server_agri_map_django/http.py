"""P1: HTTP semantics helpers (RFC 9110 Location on 201s)."""
from django.urls import reverse


class CanonicalLocationMixin:
    """Attach a canonical v1 Location header to 201 responses.

    Set `location_route` to the namespaced detail route. Override
    `get_location_kwargs(data)` when the route needs more than {pk: id}.
    Set `location_static` for kwarg-less routes (e.g. farmer-me).
    """

    location_route = None
    location_url_kwarg = 'pk'
    location_static = None

    def get_location_kwargs(self, data):
        return {self.location_url_kwarg: data['id']}

    def get_success_headers(self, data):
        try:
            headers = super().get_success_headers(data)  # type: ignore[misc]
        except AttributeError:
            headers = {}
        location = self.location_static
        if location is None and self.location_route and isinstance(data, dict) and data.get('id') is not None:
            try:
                location = reverse(self.location_route, kwargs=self.get_location_kwargs(data))
            except Exception:
                location = None
        if location is not None:
            headers['Location'] = location
        return headers
