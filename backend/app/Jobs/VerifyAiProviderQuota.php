<?php

namespace App\Jobs;

use App\Models\AiProvider;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class VerifyAiProviderQuota implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected AiProvider $aiProvider
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $provider = $this->aiProvider->provider;
        $apiKey = $this->aiProvider->api_key;
        $endpointUrl = $this->aiProvider->endpoint_url;

        $status = 'error';
        $note = '';

        $client = Http::timeout(5);

        try {
            if ($endpointUrl && ! $this->isSsrfSafe($endpointUrl, $provider)) {
                $note = 'Security verification failed: Prohibited private or loopback IP range connection attempt (SSRF Protection).';
            } elseif ($provider === 'local') {
                $url = $endpointUrl ?: 'http://127.0.0.1:11434/v1';
                $url = rtrim($url, '/');
                $response = $client->get("{$url}/models");

                if ($response->successful()) {
                    $status = 'verified';
                    $note = 'Local endpoint connection successful.';
                } else {
                    $note = "Failed to connect to local models endpoint. Status code: {$response->status()}";
                }
            } elseif ($provider === 'openai' || $provider === 'custom') {
                $url = $endpointUrl ?: 'https://api.openai.com/v1';
                $url = rtrim($url, '/');

                if (blank($apiKey)) {
                    $note = 'API Key is missing.';
                } else {
                    $response = $client->withHeaders([
                        'Authorization' => "Bearer {$apiKey}",
                    ])->get("{$url}/models");

                    if ($response->successful()) {
                        $status = 'verified';
                        $note = 'API connection and key verification successful.';
                    } elseif ($response->status() === 401) {
                        $note = 'Invalid API key (Unauthorized 401).';
                    } else {
                        $note = "Provider returned status code: {$response->status()}";
                    }
                }
            } elseif ($provider === 'gemini' || $provider === 'google') {
                if (blank($apiKey)) {
                    $note = 'API Key is missing.';
                } else {
                    $response = $client->get('https://generativelanguage.googleapis.com/v1beta/models', [
                        'key' => $apiKey,
                    ]);

                    if ($response->successful()) {
                        $status = 'verified';
                        $note = 'API connection and key verification successful.';
                    } elseif ($response->status() === 400 || $response->status() === 403) {
                        $note = 'Invalid API key (unauthorized or bad request).';
                    } else {
                        $note = "Provider returned status code: {$response->status()}";
                    }
                }
            } elseif ($provider === 'anthropic') {
                if (blank($apiKey)) {
                    $note = 'API Key is missing.';
                } else {
                    $response = $client->withHeaders([
                        'x-api-key' => $apiKey,
                        'anthropic-version' => '2023-06-01',
                    ])->get('https://api.anthropic.com/v1/models');

                    if ($response->successful()) {
                        $status = 'verified';
                        $note = 'API connection and key verification successful.';
                    } elseif ($response->status() === 401) {
                        $note = 'Invalid API key (Unauthorized 401).';
                    } else {
                        $note = "Provider returned status code: {$response->status()}";
                    }
                }
            } else {
                $note = "Unknown provider: {$provider}";
            }
        } catch (ConnectionException $e) {
            $note = "Connection failed / timeout: {$e->getMessage()}";
        } catch (\Throwable $e) {
            $note = "An unexpected error occurred during verification: {$e->getMessage()}";
        }

        $this->aiProvider->status = $status;
        $this->aiProvider->last_verified_at = now();
        $this->aiProvider->quota_limit ??= ($provider === 'local' ? null : 1000000);
        $this->aiProvider->quota_used = min($this->aiProvider->quota_used, $this->aiProvider->quota_limit ?? $this->aiProvider->quota_used);

        $this->aiProvider->metadata = array_merge($this->aiProvider->metadata ?? [], [
            'verificationNote' => $note,
        ]);

        $this->aiProvider->save();
    }

    /**
     * Determine if the endpoint URL is safe from SSRF attacks.
     * Allow private/loopback IPs only for 'local' provider type.
     */
    private function isSsrfSafe(string $url, string $provider): bool
    {
        if ($provider === 'local') {
            return true;
        }

        $host = parse_url($url, PHP_URL_HOST);
        if (! $host) {
            return false;
        }

        $ips = [];

        // Resolve IPv4
        $ipv4s = gethostbynamel($host);
        if (is_array($ipv4s)) {
            $ips = array_merge($ips, $ipv4s);
        }

        // Resolve IPv6 if supported
        if (function_exists('dns_get_record')) {
            $dns = @dns_get_record($host, DNS_AAAA);
            if (is_array($dns)) {
                foreach ($dns as $record) {
                    if (isset($record['ipv6'])) {
                        $ips[] = $record['ipv6'];
                    }
                }
            }
        }

        if (empty($ips)) {
            return false; // Cannot resolve, block for security
        }

        foreach ($ips as $ip) {
            // Validate that the IP does NOT fall under private or reserved ranges
            $isPublic = filter_var(
                $ip,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            );

            if (! $isPublic) {
                return false;
            }
        }

        return true;
    }
}
