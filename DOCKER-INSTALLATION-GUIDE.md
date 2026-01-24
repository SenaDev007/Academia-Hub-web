# 🐳 Guide d'Installation Docker - Academia Hub

**Date** : 2025-01-17  
**Pour** : Windows (Git Bash)

---

## ❌ Problème Détecté

Vous avez l'erreur :
```
'docker-compose' n'est pas reconnu en tant que commande interne
```

Cela signifie que **Docker n'est pas installé** ou **n'est pas dans le PATH**.

---

## ✅ Solution : Installer Docker Desktop

### Étape 1 : Télécharger Docker Desktop

1. Allez sur : https://www.docker.com/products/docker-desktop
2. Téléchargez **Docker Desktop for Windows**
3. Installez l'application

### Étape 2 : Installer Docker Desktop

1. Exécutez le fichier d'installation téléchargé
2. Suivez l'assistant d'installation
3. **Important** : Cochez l'option "Add Docker Desktop to PATH" si disponible
4. Redémarrez votre ordinateur si demandé

### Étape 3 : Démarrer Docker Desktop

1. Lancez **Docker Desktop** depuis le menu Démarrer
2. Attendez que Docker Desktop soit complètement démarré
   - L'icône Docker dans la barre des tâches doit être verte
   - Vous devriez voir "Docker Desktop is running"

### Étape 4 : Vérifier l'Installation

Ouvrez **Git Bash** et exécutez :

```bash
# Vérifier Docker
docker --version
# Devrait afficher : Docker version 24.x.x ou similaire

# Vérifier Docker Compose (nouvelle syntaxe)
docker compose version
# Devrait afficher : Docker Compose version v2.x.x

# Tester Docker
docker ps
# Devrait afficher une liste vide (ou vos conteneurs)
```

---

## 🔧 Si Docker est Installé mais Pas Reconnu

### Problème : Docker dans le PATH mais pas reconnu dans Git Bash

**Solution 1 : Redémarrer Git Bash**
```bash
# Fermez et rouvrez Git Bash
```

**Solution 2 : Vérifier le PATH dans Git Bash**
```bash
# Vérifier si Docker est dans le PATH
echo $PATH | grep -i docker

# Si vide, ajouter Docker au PATH (temporaire)
export PATH="/c/Program Files/Docker/Docker/resources/bin:$PATH"
```

**Solution 3 : Utiliser le chemin complet**
```bash
# Trouver le chemin de Docker
where docker
# Généralement : C:\Program Files\Docker\Docker\resources\bin\docker.exe

# Utiliser le chemin complet
"/c/Program Files/Docker/Docker/resources/bin/docker.exe" --version
```

---

## 🚀 Après Installation : Démarrer l'Application

Une fois Docker Desktop installé et démarré :

```bash
# 1. Naviguer vers la racine du projet
cd "D:\Projet YEHI OR Tech\Academia Hub Web"

# 2. Démarrer avec Docker Compose
npm run start:docker

# Ou directement
docker compose -f docker-compose.dev.yml up
```

---

## 📝 Notes Importantes

### Nouvelle Syntaxe Docker Compose

Les versions récentes de Docker utilisent `docker compose` (sans tiret) au lieu de `docker-compose`.

Les scripts npm ont été mis à jour pour utiliser la nouvelle syntaxe.

### WSL 2 Requis (Windows)

Docker Desktop pour Windows nécessite **WSL 2** (Windows Subsystem for Linux).

Si vous n'avez pas WSL 2 :
1. Docker Desktop vous proposera de l'installer automatiquement
2. Ou installez-le manuellement : https://docs.microsoft.com/windows/wsl/install

### Performance

Docker Desktop peut être gourmand en ressources. Assurez-vous d'avoir :
- Au moins 4 GB de RAM disponibles
- Virtualisation activée dans le BIOS

---

## 🐛 Dépannage

### Erreur : "WSL 2 installation is incomplete"

**Solution** :
1. Installez WSL 2 : https://docs.microsoft.com/windows/wsl/install
2. Redémarrez Docker Desktop

### Erreur : "Docker daemon is not running"

**Solution** :
1. Vérifiez que Docker Desktop est démarré
2. L'icône Docker dans la barre des tâches doit être verte
3. Redémarrez Docker Desktop si nécessaire

### Erreur : "Port already in use"

**Solution** :
```bash
# Vérifier les ports utilisés
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Arrêter les processus qui utilisent ces ports
# Ou changer les ports dans docker-compose.dev.yml
```

---

## ✅ Checklist d'Installation

- [ ] Docker Desktop téléchargé
- [ ] Docker Desktop installé
- [ ] Docker Desktop démarré (icône verte)
- [ ] `docker --version` fonctionne
- [ ] `docker compose version` fonctionne
- [ ] `docker ps` fonctionne
- [ ] WSL 2 installé (si requis)

---

## 🎯 Prochaines Étapes

Une fois Docker installé :

1. **Démarrer Docker Desktop**
2. **Attendre qu'il soit complètement prêt**
3. **Exécuter** : `npm run start:docker`
4. **Ouvrir** : http://localhost:3001

---

**Besoin d'aide ?** Consultez la documentation Docker : https://docs.docker.com/
