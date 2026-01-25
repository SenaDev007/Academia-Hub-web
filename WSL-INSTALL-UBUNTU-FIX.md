# 🔧 Solution : Erreur d'Installation Ubuntu via WSL

**Erreur** : `0x80072efd` lors de `wsl --install -d Ubuntu`

**Cause** : Problème de connexion réseau ou de proxy.

---

## ✅ Solutions

### Solution 1 : Installer via Microsoft Store (RECOMMANDÉ)

**Plus fiable que la ligne de commande** :

1. **Ouvrir Microsoft Store**
   - Appuyer sur `Win` et rechercher "Microsoft Store"
   - Ou ouvrir depuis le menu Démarrer

2. **Rechercher "Ubuntu"**
   - Taper "Ubuntu" dans la barre de recherche
   - Sélectionner **"Ubuntu"** (version 22.04 LTS recommandée)

3. **Installer**
   - Cliquer sur "Obtenir" ou "Installer"
   - Attendre la fin du téléchargement et de l'installation

4. **Lancer Ubuntu**
   - Cliquer sur "Lancer" dans Microsoft Store
   - Ou rechercher "Ubuntu" dans le menu Démarrer

5. **Configurer Ubuntu**
   - Attendre le démarrage (première fois : 1-2 minutes)
   - Créer un **nom d'utilisateur** (ex: `academia`)
   - Créer un **mot de passe** (ne s'affiche pas à la frappe, c'est normal)
   - Confirmer le mot de passe

6. **Fermer Ubuntu**
   - Taper `exit` dans Ubuntu
   - Ou simplement fermer la fenêtre

7. **Vérifier l'installation**
   ```powershell
   wsl --list --verbose
   ```
   Devrait afficher :
   ```
   NAME      STATE           VERSION
   Ubuntu    Running         2
   ```

8. **Redémarrer Docker Desktop**
   - Cliquer sur "Restart" dans Docker Desktop
   - Attendre que l'icône soit verte

9. **Vérifier Docker**
   ```bash
   docker ps
   ```

---

### Solution 2 : Corriger le Problème de Réseau

**Si l'installation via Store échoue aussi** :

#### A. Vérifier la Connexion Internet

```powershell
# Tester la connexion
ping google.com
ping microsoft.com
```

#### B. Vérifier le Proxy

1. **Ouvrir Paramètres Windows**
   - `Win + I` → Réseau et Internet → Proxy

2. **Vérifier les paramètres de proxy**
   - Si un proxy est configuré, le désactiver temporairement
   - Ou configurer WSL pour utiliser le proxy

#### C. Réinitialiser le Cache Windows Store

```powershell
# Dans PowerShell (Admin)
wsreset.exe
```

Puis réessayer l'installation via Microsoft Store.

---

### Solution 3 : Télécharger Ubuntu Manuellement

1. **Télécharger Ubuntu depuis le site officiel**
   - Visiter : https://www.microsoft.com/store/productId/9PDXGNCFSCZV
   - Ou rechercher "Ubuntu" dans Microsoft Store via navigateur

2. **Installer via le lien direct**
   - Cliquer sur "Obtenir" dans le navigateur
   - Microsoft Store s'ouvrira
   - Suivre les étapes d'installation

---

### Solution 4 : Utiliser une Distribution Alternative

Si Ubuntu ne fonctionne pas, essayer **Debian** (plus léger) :

**Via PowerShell (Admin)** :
```powershell
wsl --install -d Debian
```

**Via Microsoft Store** :
- Rechercher "Debian" dans Microsoft Store
- Installer "Debian GNU/Linux"

---

## 🔍 Vérification Post-Installation

Après avoir installé Ubuntu (ou Debian) :

```powershell
# Vérifier les distributions installées
wsl --list --verbose

# Tester Ubuntu
wsl -d Ubuntu -- echo "Hello from Ubuntu"

# Vérifier la version
wsl -d Ubuntu -- uname -a
```

**Résultat attendu** :
- Ubuntu apparaît dans la liste avec VERSION 2
- Les commandes fonctionnent sans erreur

---

## 🐛 Dépannage Supplémentaire

### Erreur : "Ubuntu is already installed"

**Solution** :
```powershell
# Vérifier si Ubuntu est installé
wsl --list --verbose

# Si Ubuntu apparaît mais ne fonctionne pas
wsl --unregister Ubuntu
# Puis réinstaller via Microsoft Store
```

### Erreur : "The distribution is already installed"

**Solution** :
```powershell
# Vérifier l'état
wsl --list --all

# Si Ubuntu est en cours d'installation
# Attendre la fin, puis :
wsl --set-default Ubuntu
```

### Docker Desktop ne démarre toujours pas

**Vérifications** :
1. Ubuntu est installé et fonctionne : `wsl -d Ubuntu -- echo "test"`
2. WSL2 est la version par défaut : `wsl --status`
3. Docker Desktop est à jour
4. Redémarrer l'ordinateur si nécessaire

---

## ✅ Checklist Finale

- [ ] Ubuntu installé via Microsoft Store
- [ ] Ubuntu configuré (nom d'utilisateur et mot de passe créés)
- [ ] `wsl --list --verbose` affiche Ubuntu avec VERSION 2
- [ ] `wsl -d Ubuntu -- echo "test"` fonctionne
- [ ] Docker Desktop redémarré
- [ ] `docker ps` fonctionne
- [ ] L'icône Docker est verte

---

## 🚀 Après Résolution

Une fois Docker Desktop fonctionnel :

```bash
# Démarrer Academia Hub
npm run start:docker
```

---

## 📝 Notes

- **Vous n'avez pas besoin d'utiliser Ubuntu** - Docker Desktop l'utilisera automatiquement
- **Ubuntu peut rester fermé** - WSL2 fonctionne en arrière-plan
- **La distribution minimale suffit** - Pas besoin de configurer Ubuntu au-delà de la création du compte

---

**Lien direct Microsoft Store** : https://www.microsoft.com/store/productId/9PDXGNCFSCZV
