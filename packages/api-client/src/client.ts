import type {
  Religion,
  HolySite,
  Temple,
  Patriarch,
  Teaching,
  Seal,
} from './types';

/** Paginated list response from the API. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** Error thrown when an API request fails. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`API error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Typed HTTP client for the Zuting backend API.
 *
 * Uses the native `fetch` API — works in browsers, Node 18+, React Native,
 * and any other runtime that provides a global `fetch`.
 *
 * @example
 * ```ts
 * const api = new ZutingApiClient('http://localhost:3002/api');
 * const religions = await api.getReligions();
 * const sites = await api.getHolySites(religions[0].id);
 * ```
 */
export class ZutingApiClient {
  constructor(private readonly baseUrl: string = '/api') {}

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Generic fetch wrapper with query-param support and error handling.
   * All public methods delegate here.
   */
  private async fetch<T>(
    path: string,
    params?: Record<string, string | undefined>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`, globalThis.location?.origin ?? 'http://localhost');

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, value);
        }
      }
    }

    // When baseUrl is already absolute (http://…) we want the full URL.
    // When it is relative (/api) we keep just pathname + search so fetch
    // resolves against the current origin in browsers.
    const fetchUrl = this.baseUrl.startsWith('http')
      ? url.toString()
      : `${url.pathname}${url.search}`;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        body = await response.text().catch(() => null);
      }
      throw new ApiError(response.status, response.statusText, body);
    }

    return response.json() as Promise<T>;
  }

  // ---------------------------------------------------------------------------
  // Religion endpoints
  // ---------------------------------------------------------------------------

  /** Fetch all religions (12 items). */
  async getReligions(): Promise<Religion[]> {
    const res = await this.fetch<PaginatedResponse<Religion>>('/religions', { limit: '100' });
    return res.items;
  }

  /** Fetch a single religion by its slug (e.g. "buddhism"). */
  async getReligion(slug: string): Promise<Religion> {
    const res = await this.fetch<PaginatedResponse<Religion>>('/religions', { slug, limit: '100' });
    if (res.items.length === 0) {
      throw new ApiError(404, 'Not Found', { message: `Religion with slug "${slug}" not found` });
    }
    return res.items[0];
  }

  // ---------------------------------------------------------------------------
  // Holy Site endpoints
  // ---------------------------------------------------------------------------

  /** Fetch holy sites, optionally filtered by religionId. */
  async getHolySites(religionId?: string): Promise<HolySite[]> {
    const res = await this.fetch<PaginatedResponse<HolySite>>('/holy-sites', { religionId, limit: '100' });
    return res.items;
  }

  /** Fetch a single holy site by id. */
  async getHolySite(id: string): Promise<HolySite> {
    return this.fetch<HolySite>(`/holy-sites/${id}`);
  }

  // ---------------------------------------------------------------------------
  // Temple endpoints
  // ---------------------------------------------------------------------------

  /** Fetch temples, optionally filtered by religionId. */
  async getTemples(religionId?: string): Promise<Temple[]> {
    const res = await this.fetch<PaginatedResponse<Temple>>('/temples', { religionId, limit: '100' });
    return res.items;
  }

  /** Fetch a single temple by id. */
  async getTemple(id: string): Promise<Temple> {
    return this.fetch<Temple>(`/temples/${id}`);
  }

  // ---------------------------------------------------------------------------
  // Patriarch endpoints
  // ---------------------------------------------------------------------------

  /** Fetch patriarchs, optionally filtered by religionId. */
  async getPatriarchs(religionId?: string): Promise<Patriarch[]> {
    const res = await this.fetch<PaginatedResponse<Patriarch>>('/patriarchs', { religionId, limit: '100' });
    return res.items;
  }

  /** Fetch a single patriarch by id. */
  async getPatriarch(id: string): Promise<Patriarch> {
    return this.fetch<Patriarch>(`/patriarchs/${id}`);
  }

  // ---------------------------------------------------------------------------
  // Teaching endpoints
  // ---------------------------------------------------------------------------

  /** Fetch teachings, optionally filtered by religionId. */
  async getTeachings(religionId?: string): Promise<Teaching[]> {
    const res = await this.fetch<PaginatedResponse<Teaching>>('/teachings', { religionId, limit: '100' });
    return res.items;
  }

  /** Fetch a single teaching by id. */
  async getTeaching(id: string): Promise<Teaching> {
    return this.fetch<Teaching>(`/teachings/${id}`);
  }

  // ---------------------------------------------------------------------------
  // Seal endpoints
  // ---------------------------------------------------------------------------

  /** Fetch seals, optionally filtered by series name. */
  async getSeals(series?: string): Promise<Seal[]> {
    const res = await this.fetch<PaginatedResponse<Seal>>('/seals', { series, limit: '100' });
    return res.items;
  }

  /** Fetch a single seal by its numeric id. */
  async getSeal(id: number): Promise<Seal> {
    return this.fetch<Seal>(`/seals/${id}`);
  }
}
