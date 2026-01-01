# Parcours de Souscription et Activation - Academia Hub

## 🎯 Objectif
Concevoir un parcours de souscription simple, sécurisé et sans confusion pour l'activation d'un compte établissement via Fedapay.

---

## 📋 Étapes du Parcours

### **ÉTAPE 1 : Informations de l'Établissement**
**Objectif** : Collecter les données de base de l'établissement

**Champs requis** :
- Nom de l'établissement *
- Type d'établissement (Maternelle, Primaire, Secondaire, Mixte) *
- Adresse complète *
- Ville *
- Pays (défaut: Bénin) *
- Téléphone *
- Email *
- Niveaux scolaires proposés * (multi-sélection)

**Validation** :
- Tous les champs marqués * sont obligatoires
- Email doit être valide
- Téléphone doit être au format valide
- Au moins un niveau scolaire doit être sélectionné

**Message d'erreur** : "Veuillez remplir tous les champs obligatoires"

**CTA** : "Continuer" → Étape 2

---

### **ÉTAPE 2 : Responsable Principal**
**Objectif** : Identifier le responsable principal de l'établissement

**Champs requis** :
- Nom complet *
- Fonction (Directeur, Promoteur, Gestionnaire, Autre) *
- Email * (sera utilisé pour la connexion)
- Téléphone *

**Validation** :
- Email doit être valide et unique (vérification backend)
- Téléphone doit être au format valide

**Message d'erreur** : "Veuillez remplir tous les champs obligatoires"

**CTA** : "Retour" | "Continuer" → Étape 3

---

### **ÉTAPE 3 : Récapitulatif et Validation**
**Objectif** : Permettre à l'utilisateur de vérifier toutes les informations avant paiement

**Affichage** :
- Section "Établissement" : Toutes les informations de l'étape 1
- Section "Responsable" : Toutes les informations de l'étape 2
- Section "Souscription" :
  - Souscription initiale : 100.000 FCFA
  - Détails de ce qui est inclus
  - Mention : "Période d'essai de 30 jours incluse"

**Actions** :
- Possibilité de modifier (retour aux étapes précédentes)
- CTA : "Procéder au paiement" → Étape 4

---

### **ÉTAPE 4 : Paiement Fedapay (100.000 FCFA)**
**Objectif** : Finaliser le paiement de la souscription initiale

**Processus** :
1. Affichage du montant : 100.000 FCFA
2. Intégration du widget Fedapay
3. Sélection du mode de paiement (Mobile Money, Carte bancaire)
4. Redirection vers Fedapay pour finalisation
5. Retour avec statut de paiement

**États possibles** :
- **En attente** : Paiement en cours
- **Réussi** : Paiement validé → Étape 5 (Confirmation)
- **Échoué** : Paiement refusé → Message d'erreur + possibilité de réessayer
- **Annulé** : Utilisateur a annulé → Retour à l'étape 3

**Messages** :
- En attente : "Votre paiement est en cours de traitement..."
- Réussi : "Paiement validé avec succès !"
- Échoué : "Le paiement a échoué. Veuillez réessayer."
- Annulé : "Paiement annulé. Vous pouvez réessayer à tout moment."

**CTA** : "Retour" (vers étape 3) | "Réessayer le paiement"

---

### **ÉTAPE 5 : Confirmation et Activation**
**Objectif** : Confirmer l'activation et fournir les informations de connexion

**Affichage** :
- ✅ Message de confirmation : "Votre compte Academia Hub est activé !"
- Informations de connexion :
  - Email du responsable (identifiant)
  - Lien pour définir le mot de passe
  - Lien vers la page de connexion
- Prochaines étapes :
  - Configuration initiale (niveaux, classes)
  - Formation (lien vers ressources)
  - Support (contact)

**Actions** :
- CTA principal : "Accéder à mon compte" → Redirection vers /login
- CTA secondaire : "Recevoir les informations par email"

**Email de confirmation** :
- Envoi automatique avec :
  - Identifiants de connexion
  - Lien de définition de mot de passe
  - Guide de démarrage rapide

---

## 🔄 Statuts du Compte

### **1. PENDING_ACTIVATION** (En attente d'activation)
**Définition** : Compte créé, paiement en attente ou non effectué

**Caractéristiques** :
- Compte créé dans la base de données
- Paiement non validé
- Accès limité (aucun accès au dashboard)
- Durée : Maximum 7 jours (après, compte suspendu)

**Actions possibles** :
- Finaliser le paiement
- Annuler la souscription

**Messages** :
- "Votre compte est en attente d'activation. Finalisez votre paiement pour accéder à Academia Hub."

---

### **2. TRIAL** (Période d'essai - 30 jours)
**Définition** : Paiement validé, période d'essai de 30 jours active

**Caractéristiques** :
- Paiement initial (100.000 FCFA) validé
- Accès complet à tous les modules
- Période d'essai de 30 jours à compter de l'activation
- Aucun abonnement mensuel encore actif

**Actions possibles** :
- Utiliser tous les modules
- Configurer l'établissement
- Recevoir la formation

**Messages** :
- "Période d'essai active. X jours restants avant le démarrage de l'abonnement mensuel."
- Notification à J-7, J-3, J-1 avant la fin de l'essai

**Transition** :
- À J+30 : Passage automatique à ACTIVE_SUBSCRIPTION
- Si résiliation avant J+30 : Passage à CANCELLED

---

### **3. ACTIVE_SUBSCRIPTION** (Abonnement actif)
**Définition** : Période d'essai terminée, abonnement mensuel actif

**Caractéristiques** :
- Abonnement mensuel (15.000 FCFA) actif
- Paiement récurrent automatique via Fedapay
- Accès complet à tous les modules
- Support technique prioritaire

**Actions possibles** :
- Utiliser tous les modules
- Résilier l'abonnement (à tout moment)

**Messages** :
- "Votre abonnement est actif. Prochain paiement : [date]"

**Transition** :
- Si paiement échoue : Passage à SUSPENDED_SUBSCRIPTION
- Si résiliation : Passage à CANCELLED

---

### **4. SUSPENDED_SUBSCRIPTION** (Abonnement suspendu)
**Définition** : Abonnement actif mais paiement mensuel en échec

**Caractéristiques** :
- Paiement mensuel échoué
- Accès limité (lecture seule, pas de modifications)
- Durée de grâce : 7 jours pour régulariser

**Actions possibles** :
- Régulariser le paiement (relancer via Fedapay)
- Résilier l'abonnement

**Messages** :
- "Votre abonnement est suspendu. Veuillez régulariser votre paiement pour réactiver l'accès complet."
- Notifications à J-7, J-3, J-1 avant suspension définitive

**Transition** :
- Si paiement régularisé : Retour à ACTIVE_SUBSCRIPTION
- Si non régularisé après 7 jours : Passage à CANCELLED

---

### **5. CANCELLED** (Résilié)
**Définition** : Compte résilié (volontairement ou après échec de paiement)

**Caractéristiques** :
- Abonnement résilié
- Accès complètement bloqué
- Données conservées pendant 90 jours (conformité)

**Actions possibles** :
- Réactiver le compte (nouvelle souscription initiale requise)
- Exporter les données (dans les 90 jours)

**Messages** :
- "Votre compte est résilié. Vous pouvez réactiver à tout moment en effectuant une nouvelle souscription."

---

## 💳 Intégration Fedapay

### **Paiement Unique (Souscription Initiale)**

**Flux** :
1. Utilisateur clique sur "Payer et activer Academia Hub"
2. Création d'une transaction côté backend
3. Redirection vers Fedapay avec :
   - Montant : 100.000 FCFA
   - Description : "Souscription initiale Academia Hub"
   - Callback URL : `/signup/payment/callback`
   - Metadata : ID établissement, email responsable
4. Utilisateur finalise le paiement sur Fedapay
5. Fedapay redirige vers callback URL avec statut
6. Backend vérifie le statut et met à jour le compte
7. Frontend affiche la confirmation

**Webhook Fedapay** :
- URL : `/api/payments/fedapay/webhook`
- Vérification de la signature
- Mise à jour du statut du compte
- Envoi d'email de confirmation

---

### **Paiement Récurrent (Abonnement Mensuel)**

**Flux** :
1. À J+30 de l'activation, création automatique d'un abonnement récurrent
2. Premier paiement mensuel (15.000 FCFA) déclenché automatiquement
3. Si succès : Compte passe à ACTIVE_SUBSCRIPTION
4. Si échec : Compte passe à SUSPENDED_SUBSCRIPTION
5. Renouvellement automatique chaque mois

**Gestion des échecs** :
- 3 tentatives automatiques (J+0, J+2, J+4)
- Notifications à chaque tentative
- Après 3 échecs : Suspension définitive

---

## 📧 Messages UX et Notifications

### **Messages de Confirmation**

#### **Après Paiement Réussi**
```
✅ Paiement validé avec succès !

Votre compte Academia Hub est maintenant activé.

Informations de connexion :
- Email : [email]
- Un email de confirmation a été envoyé avec votre lien de connexion

Prochaines étapes :
1. Définissez votre mot de passe (lien dans l'email)
2. Connectez-vous à votre compte
3. Configurez votre établissement

[Accéder à mon compte] [Recevoir les informations par email]
```

#### **Période d'Essai Active**
```
🎉 Bienvenue sur Academia Hub !

Votre période d'essai de 30 jours est active.
Vous avez accès à tous les modules.

Prochain paiement mensuel : [date]
Montant : 15.000 FCFA

[Accéder au dashboard]
```

#### **Abonnement Actif**
```
✅ Votre abonnement est actif

Prochain paiement : [date]
Montant : 15.000 FCFA

Vous avez accès à tous les modules et au support prioritaire.

[Accéder au dashboard] [Gérer mon abonnement]
```

---

### **Messages d'Erreur**

#### **Paiement Échoué**
```
❌ Le paiement a échoué

Raison : [raison fournie par Fedapay]

Veuillez réessayer ou contacter le support si le problème persiste.

[Réessayer le paiement] [Contacter le support]
```

#### **Paiement Annulé**
```
⚠️ Paiement annulé

Vous avez annulé le paiement. Vous pouvez réessayer à tout moment.

Votre compte est en attente d'activation.

[Réessayer le paiement] [Retour au récapitulatif]
```

#### **Compte Suspendu**
```
⚠️ Abonnement suspendu

Votre dernier paiement mensuel a échoué.

Vous avez 7 jours pour régulariser votre paiement.
Après ce délai, votre compte sera résilié.

[Régulariser le paiement] [Contacter le support]
```

---

### **Notifications Email**

#### **Email de Confirmation d'Activation**
**Sujet** : "Votre compte Academia Hub est activé !"

**Contenu** :
```
Bonjour [Nom],

Votre compte Academia Hub pour [Nom Établissement] est maintenant activé !

Informations de connexion :
- Email : [email]
- Lien de connexion : [lien]
- Définir votre mot de passe : [lien]

Période d'essai : 30 jours
Prochain paiement mensuel : [date]

Guide de démarrage : [lien]

Besoin d'aide ? Contactez-nous : support@academiahub.com

Cordialement,
L'équipe Academia Hub
```

#### **Email Rappel Fin d'Essai**
**Sujet** : "Votre période d'essai se termine bientôt"

**Contenu** :
```
Bonjour [Nom],

Votre période d'essai Academia Hub se termine dans [X] jours.

À partir du [date], votre abonnement mensuel de 15.000 FCFA démarrera automatiquement.

Vous pouvez résilier à tout moment avant cette date.

[Gérer mon abonnement] [Contacter le support]
```

---

## 🔒 Sécurité

### **Mesures de Sécurité**

1. **Validation Backend** :
   - Toutes les données sont validées côté serveur
   - Vérification de l'unicité de l'email
   - Vérification de la signature Fedapay

2. **Protection des Données** :
   - Chiffrement des données sensibles
   - HTTPS obligatoire
   - Pas de stockage des informations de carte bancaire

3. **Gestion des Sessions** :
   - Tokens d'authentification sécurisés
   - Expiration automatique des sessions
   - Protection CSRF

4. **Audit Trail** :
   - Toutes les actions sont tracées
   - Historique des paiements
   - Logs de sécurité

---

## ✅ Checklist de Validation

### **Avant Mise en Production**

- [ ] Intégration Fedapay testée (sandbox)
- [ ] Webhooks Fedapay configurés et testés
- [ ] Emails de confirmation fonctionnels
- [ ] Gestion des erreurs de paiement
- [ ] Gestion des statuts de compte
- [ ] Notifications automatiques configurées
- [ ] Tests de sécurité effectués
- [ ] Documentation utilisateur disponible

---

## 📊 Métriques à Suivre

- Taux de complétion du formulaire
- Taux de conversion paiement
- Taux d'abandon par étape
- Temps moyen de complétion
- Taux d'échec de paiement
- Taux de réactivation après suspension

---

**Document créé le** : [Date]
**Dernière mise à jour** : [Date]
**Version** : 1.0

