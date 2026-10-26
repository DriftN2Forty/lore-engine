# LoreEngine — VPS Setup and Cloudflare Plan

**Status:** Future deployment plan. The application has not been started, no VPS has been selected or rented, and no domain or Cloudflare production configuration is in place. This document records the intended path from WSL development to a VPS; it is not a provisioning checklist to execute yet.

## 1. Intended progression

1. Develop locally in WSL, starting with the selected TypeScript/Next.js and PostgreSQL stack. Keep development local; a Cloudflare Quick Tunnel is an optional temporary test tool, not a persistent development hostname.
2. PostgreSQL is a required part of the application stack. For local development, PostgreSQL is installed in WSL; for hosting, decide whether to run it on the VPS or use a separate managed PostgreSQL service, then deploy a reproducible, pinned application release.
3. Put the owned domain under Cloudflare DNS and route the application hostname to the VPS. Decide at deployment time whether to use a Cloudflare Tunnel or proxied DNS with a tightly restricted origin firewall. Do not assume the random `trycloudflare.com` Quick Tunnel URL is durable or suitable for production.
4. Operate the VPS under the application's established backup, monitoring, recovery, privacy, and budget requirements. RunPod remains the separately selected inference provider; hosting the application on a VPS does not imply putting the model/GPU there.

This future VPS intention supersedes the managed-Render hosting default in [the overview](project-overview.md) and [decision D09](project-decisions.md#d09--hosting-and-operational-shape). Provider, region, sizing, operating system, database placement, and Cloudflare routing are still open implementation choices. Recheck total costs against the existing fixed-hosting target before committing; this document does not authorize spend or select a provider.

## 2. Capture before renting

| Area | Record when known |
| --- | --- |
| VPS provider and product | Provider, plan/SKU, CPU/RAM/disk, included transfer, backups/snapshots, support, renewal terms, and current monthly price. |
| Region and networking | Region, public IPv4/IPv6 availability, bandwidth limits, reverse DNS needs, and any provider firewall/security-group rules. |
| Operating system | Supported distribution/version, image identifier, security-update policy, and any required reboot/update process. |
| Application runtime | Node.js LTS version, package manager/lockfile, build artifact or immutable container image, process supervision, health/readiness checks, and release/rollback method. |
| Database and state | PostgreSQL is required. Record whether it is on the VPS or managed separately; supported version, disk/IO limits, private connectivity, encryption, backup/export destination, restore procedure, and data residency. Keep uploads and generated/private data out of disposable locations. |
| Domain and Cloudflare | Domain ownership/renewal, DNS zone, application hostname, DNS records, proxy status, TLS mode/certificate ownership, and selected Tunnel-versus-origin-firewall design. Record only non-secret identifiers here. |
| Access and secrets | Named administrators, SSH key/access policy if SSH is used, least-privilege deploy identity, secret-storage location, rotation/recovery process, and emergency access. Never put private keys, API tokens, passwords, or recovery codes in this repository. |
| Operations | Monitoring/alert destinations, log retention and content minimization, backup schedule and off-VPS destination, restore-test cadence, patching, spend alerts, and incident/rollback steps. |
| Costs | VPS, storage, backups, domain, Cloudflare products (if any), database, email, monitoring, bandwidth/overages, and RunPod inference tracked separately against the current budgets. |

Use placeholders in examples and handoffs. Store machine-specific values in an access-controlled operational system, not in this public project documentation.

## 3. Cloudflare routing and origin boundary

Choose one supported production routing design and document its exact behavior:

- **Cloudflare Tunnel:** the VPS runs `cloudflared` and opens an outbound tunnel; Cloudflare routes the hostname to the local application service. This avoids making the application origin directly reachable on a public ingress port, but requires a managed tunnel credential and reliable service supervision. Keep credentials in a secret store and restrict the tunnel's published hostname/service mapping.
- **Proxied DNS to the VPS:** Cloudflare DNS points the hostname at the VPS and proxies HTTP(S). Configure the VPS/provider firewall to permit only required ports and, if relying on Cloudflare as the public edge, restrict web ingress to Cloudflare's current published source ranges. Automate updates to those ranges and ensure administrative access is separately restricted. Configure TLS from Cloudflare to the origin; do not use an insecure origin mode.

Do not rely on a home ISP's CGNAT behavior for a rented VPS: the VPS has its own network exposure and firewall boundary. Do not expose database, SSH, metrics, or debug ports publicly without a specific need and restriction. Quick Tunnels are for experiments, have temporary random hostnames and no uptime guarantee, and should be stopped when not in use.

## 4. PostgreSQL and reboot startup

PostgreSQL must be available before the application accepts requests. On systemd-based Linux hosts, enable the service at boot and start it now:

```bash
sudo systemctl enable --now postgresql
systemctl is-enabled postgresql
systemctl is-active postgresql
```

On the development WSL distro, PostgreSQL 18 is installed and both checks currently report `enabled` and `active`. Enabling the service means it starts when Ubuntu boots; it does **not** necessarily start the WSL distro automatically when Windows reboots. Open/launch the Ubuntu distro after Windows startup, then verify PostgreSQL with `systemctl is-active postgresql` and a local `psql` connection. If automatic WSL startup at Windows sign-in is later needed, configure that separately (for example, a Windows Task Scheduler task that launches the distro); do not confuse that with enabling the Linux service.

## 5. Deployment and acceptance checklist

Complete and record these checks when the application and VPS deployment are actually ready:

- [ ] Confirm the VPS plan, location, recurring charges, and backup/restore capabilities fit the current spending authorization.
- [ ] Provision a supported OS with security updates, minimal installed services, restricted administrator access, and documented recovery access.
- [ ] Install/configure PostgreSQL on the selected host or managed service; confirm service startup on reboot, local/private connectivity, and successful application readiness after database startup.
- [ ] Deploy a pinned application release with secrets supplied out of band; verify service supervision, health checks, restart behavior, and rollback.
- [ ] Configure Cloudflare domain, DNS/routing, end-to-end TLS, and an origin boundary matching the selected Tunnel or proxied-DNS design.
- [ ] Verify the public hostname, redirect/canonical-host behavior, HTTPS, and that unintended origin/services are not reachable.
- [ ] Verify PostgreSQL network scope, encrypted off-VPS backups, a restore into a disposable environment, and deletion/retention behavior before any real reader data is stored.
- [ ] Verify operational alerts, content-minimized logs, release/rollback procedure, and documented owner recovery steps.
- [ ] Record actual monthly/variable costs and update the selected hosting decision if measured needs materially change it.

Items above are future tasks; no box should be checked based on this plan alone.
