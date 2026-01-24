# 🚀 Démarrage Rapide avec Docker - Academia Hub

**Pour Windows avec Git Bash**

---

## ⚠️ Problème : Docker Non Installé

Si vous voyez l'erreur :
```
'docker-compose' n'est pas reconnu en tant que commande interne
```

**Docker n'est pas installé sur votre machine.**

---

## ✅ Solution Rapide

### 1. Installer Docker Desktop

1. **Télécharger** : https://www.docker.com/products/docker-desktop
2. **Installer** Docker Desktop for Windows
3. **Démarrer** Docker Desktop (icône dans la barre des tâches)
4. **Attendre** que Docker Desktop soit complètement prêt (icône verte)

### 2. Vérifier l'Installation

Ouvrez **Git Bash** et testez :

```bash
docker --version
docker compose version
```

Si ces commandes fonctionnent, Docker est installé ✅

### 3. Démarrer l'Application

```bash
# Naviguer vers la racine du projet
cd "D:\Projet YEHI OR Tech\Academia Hub Web"

# Démarrer avec Docker
npm run start:docker
```

---

## 📋 Checklist

- [ ] Docker Desktop téléchargé
- [ ] Docker Desktop installé
- [ ] Docker Desktop démarré (icône verte dans la barre des tâches)
- [ ] `docker --version` fonctionne dans Git Bash
- [ ] `docker compose version` fonctionne dans Git Bash

---

## 🎯 Après Installation

Une fois Docker installé, vous pouvez :

```bash
# Démarrer tous les services
npm run start:docker

# Voir les logs
npm run logs:docker

# Arrêter
npm run stop:docker
```

---

## 📚 Documentation Complète

- [DOCKER-INSTALLATION-GUIDE.md](./DOCKER-INSTALLATION-GUIDE.md) - Guide d'installation détaillé
- [DOCKER-COMPOSE-GUIDE.md](./DOCKER-COMPOSE-GUIDE.md) - Guide Docker Compose complet

---

**Note** : Les scripts npm utilisent automatiquement la nouvelle syntaxe `docker compose` (sans tiret).
