# Portfolio

This is my personal portfolio website, available at https://baraa.top/

## Homepage
![image](https://github.com/user-attachments/assets/c9453068-3ed9-4e83-bd86-7d70dc1a7e87)

## Getting Started
1. **Clone or Download** this repository.
2. Open `index.html` in your browser to view the site locally.
3. To use the contact form, ensure your server supports PHP and has `submit.php` configured to handle form submissions.

## Deployment

- **Website Containerization**  
  Used a [Docker](https://www.docker.com/) stack to containerize the website for easy deployment.

- **Reverse Proxy & Security (Bunkerweb)**  
  - Used [Bunkerweb](https://github.com/bunkerity/bunkerweb) as a reverse proxy to route requests within the local network.  
  - Leverages Bunkerweb’s state-of-the-art security features.
  - Serves the website files using its built-in **Nginx webserver**.

- **Backend (PHP-FPM)**  
  - Deployed a **PHP-FPM** container to handle the website’s **contact form**.

- **Public Access & DDoS Protection (Cloudflare)**  
  - Used [Cloudflare](https://www.cloudflare.com/) to Proxy the server’s public IP.
  - Protect against DDoS attacks on my homelab.

> *Note: You can choose any deployment method that suits your environment.*
