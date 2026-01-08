import { Template } from '../types/documentSettings';

export const defaultDocumentTemplates: Template[] = [
  // Templates Académiques
  {
    id: 'TPL-ACAD-001',
    name: 'Bulletin de notes trimestriel',
    description: 'Template officiel pour les bulletins de notes avec évaluation par matière',
    documentType: 'bulletin',
    category: 'academique',
    content: `
      <div class="bulletin-template">
        <div class="header">
          <h2>BULLETIN DE NOTES - TRIMESTRE {{trimestre}}</h2>
          <p>Année scolaire: {{anneeScolaire}}</p>
        </div>
        
        <div class="student-info">
          <h3>Informations de l'élève</h3>
          <p><strong>Nom:</strong> {{nomEleve}} {{prenomEleve}}</p>
          <p><strong>Classe:</strong> {{classe}}</p>
          <p><strong>N° d'inscription:</strong> {{numeroInscription}}</p>
        </div>
        
        <div class="grades-table">
          <table>
            <thead>
              <tr>
                <th>Matières</th>
                <th>Coef.</th>
                <th>Notes</th>
                <th>Moyenne</th>
                <th>Appréciations</th>
              </tr>
            </thead>
            <tbody>
              {{#each matieres}}
              <tr>
                <td>{{nom}}</td>
                <td>{{coefficient}}</td>
                <td>{{notes}}</td>
                <td>{{moyenne}}</td>
                <td>{{appreciation}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
        
        <div class="summary">
          <p><strong>Moyenne générale:</strong> {{moyenneGenerale}}/20</p>
          <p><strong>Rang:</strong> {{rang}}/{{effectif}}</p>
          <p><strong>Mention:</strong> {{mention}}</p>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  {
    id: 'TPL-ACAD-002',
    name: 'Certificat de scolarité',
    description: 'Attestation officielle de présence dans l\'établissement',
    documentType: 'certificat',
    category: 'academique',
    content: `
      <div class="certificate-template">
        <div class="header">
          <h1>CERTIFICAT DE SCOLARITÉ</h1>
        </div>
        
        <div class="content">
          <p>Je soussigné(e), <strong>{{directeurNom}}</strong>, {{directeurTitre}} de l'établissement <strong>{{nomEcole}}</strong>, certifie que :</p>
          
          <div class="student-details">
            <p><strong>Nom et prénoms:</strong> {{nomEleve}} {{prenomEleve}}</p>
            <p><strong>Né(e) le:</strong> {{dateNaissance}} à {{lieuNaissance}}</p>
            <p><strong>Classe:</strong> {{classe}}</p>
            <p><strong>Année scolaire:</strong> {{anneeScolaire}}</p>
          </div>
          
          <p>est régulièrement inscrit(e) dans notre établissement depuis le <strong>{{dateInscription}}</strong> et y poursuit ses études avec assiduité.</p>
          
          <p>Le présent certificat est délivré pour servir et valoir ce que de droit.</p>
        </div>
        
        <div class="signature">
          <p>Fait à {{ville}}, le {{dateEmission}}</p>
          <div class="signature-space">
            <p>{{directeurNom}}</p>
            <p>{{directeurTitre}}</p>
          </div>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  {
    id: 'TPL-ACAD-003',
    name: 'Convocation parents d\'élèves',
    description: 'Modèle de convocation pour les réunions parents-professeurs',
    documentType: 'convocation',
    category: 'academique',
    content: `
      <div class="convocation-template">
        <div class="header">
          <h2>CONVOCATION</h2>
          <p>Réunion Parents-Professeurs</p>
        </div>
        
        <div class="content">
          <p>Madame, Monsieur,</p>
          
          <p>Nous avons le plaisir de vous convier à la réunion parents-professeurs qui se tiendra :</p>
          
          <div class="meeting-details">
            <p><strong>Date:</strong> {{dateReunion}}</p>
            <p><strong>Heure:</strong> {{heureReunion}}</p>
            <p><strong>Lieu:</strong> {{lieuReunion}}</p>
            <p><strong>Classe de votre enfant:</strong> {{classe}}</p>
          </div>
          
          <p>Cette réunion est importante car elle nous permettra de faire le point sur les résultats et le comportement de votre enfant, ainsi que sur les perspectives d'évolution.</p>
          
          <p>Nous comptons sur votre présence.</p>
        </div>
        
        <div class="signature">
          <p>Cordialement,</p>
          <p><strong>{{professeurPrincipal}}</strong></p>
          <p>Professeur Principal</p>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  
  // Templates Administratifs
  {
    id: 'TPL-ADMIN-001',
    name: 'Attestation de présence',
    description: 'Attestation de présence pour les examens et activités',
    documentType: 'attestation',
    category: 'administratif',
    content: `
      <div class="attestation-template">
        <div class="header">
          <h2>ATTESTATION DE PRÉSENCE</h2>
        </div>
        
        <div class="content">
          <p>Je soussigné(e), <strong>{{responsableNom}}</strong>, {{responsableFonction}} de l'établissement <strong>{{nomEcole}}</strong>, atteste que :</p>
          
          <div class="student-details">
            <p><strong>Nom et prénoms:</strong> {{nomEleve}} {{prenomEleve}}</p>
            <p><strong>Classe:</strong> {{classe}}</p>
            <p><strong>N° d'inscription:</strong> {{numeroInscription}}</p>
          </div>
          
          <p>a bien participé à l'activité suivante :</p>
          <p><strong>{{typeActivite}}</strong> - {{descriptionActivite}}</p>
          
          <div class="activity-details">
            <p><strong>Date:</strong> {{dateActivite}}</p>
            <p><strong>Heure:</strong> {{heureDebut}} - {{heureFin}}</p>
            <p><strong>Lieu:</strong> {{lieuActivite}}</p>
          </div>
          
          <p>Le présent document est délivré pour servir et valoir ce que de droit.</p>
        </div>
        
        <div class="signature">
          <p>Fait à {{ville}}, le {{dateEmission}}</p>
          <div class="signature-space">
            <p>{{responsableNom}}</p>
            <p>{{responsableFonction}}</p>
          </div>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  {
    id: 'TPL-ADMIN-002',
    name: 'Autorisation de sortie',
    description: 'Autorisation pour les sorties éducatives et voyages',
    documentType: 'attestation',
    category: 'administratif',
    content: `
      <div class="authorization-template">
        <div class="header">
          <h2>AUTORISATION DE SORTIE</h2>
        </div>
        
        <div class="content">
          <p>Madame, Monsieur,</p>
          
          <p>Nous sollicitons votre autorisation pour que votre enfant participe à la sortie éducative suivante :</p>
          
          <div class="trip-details">
            <p><strong>Nom de l'élève:</strong> {{nomEleve}} {{prenomEleve}}</p>
            <p><strong>Classe:</strong> {{classe}}</p>
            <p><strong>Destination:</strong> {{destination}}</p>
            <p><strong>Date de départ:</strong> {{dateDepart}}</p>
            <p><strong>Date de retour:</strong> {{dateRetour}}</p>
            <p><strong>Heure de départ:</strong> {{heureDepart}}</p>
            <p><strong>Heure de retour prévue:</strong> {{heureRetour}}</p>
            <p><strong>Moyen de transport:</strong> {{transport}}</p>
            <p><strong>Encadrement:</strong> {{encadrement}}</p>
            <p><strong>Coût:</strong> {{cout}} FCFA</p>
          </div>
          
          <p><strong>Objectifs pédagogiques:</strong></p>
          <p>{{objectifs}}</p>
          
          <p><strong>Conditions de participation:</strong></p>
          <ul>
            <li>Paiement de la participation</li>
            <li>Autorisation parentale signée</li>
            <li>Respect du règlement de la sortie</li>
          </ul>
        </div>
        
        <div class="authorization-form">
          <p>Je soussigné(e) <strong>{{parentNom}}</strong>, parent/tuteur de l'élève ci-dessus, autorise mon enfant à participer à cette sortie éducative.</p>
          
          <div class="signature-fields">
            <p>Signature: _________________</p>
            <p>Date: _________________</p>
          </div>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  
  // Templates Financiers
  {
    id: 'TPL-FIN-001',
    name: 'Facture de scolarité',
    description: 'Facture pour les frais de scolarité et autres charges',
    documentType: 'facture',
    category: 'financier',
    content: `
      <div class="invoice-template">
        <div class="header">
          <h2>FACTURE N° {{numeroFacture}}</h2>
          <p>Date d'émission: {{dateFacture}}</p>
        </div>
        
        <div class="billing-info">
          <div class="school-info">
            <h3>{{nomEcole}}</h3>
            <p>{{adresseEcole}}</p>
            <p>Tél: {{telephoneEcole}}</p>
            <p>Email: {{emailEcole}}</p>
          </div>
          
          <div class="client-info">
            <h3>Facturé à:</h3>
            <p><strong>{{parentNom}}</strong></p>
            <p>Parent de: {{nomEleve}} {{prenomEleve}}</p>
            <p>Classe: {{classe}}</p>
            <p>N° d'inscription: {{numeroInscription}}</p>
          </div>
        </div>
        
        <div class="invoice-details">
          <table>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Période</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {{#each articles}}
              <tr>
                <td>{{designation}}</td>
                <td>{{periode}}</td>
                <td>{{quantite}}</td>
                <td>{{prixUnitaire}} FCFA</td>
                <td>{{total}} FCFA</td>
              </tr>
              {{/each}}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4"><strong>Total HT</strong></td>
                <td><strong>{{totalHT}} FCFA</strong></td>
              </tr>
              <tr>
                <td colspan="4"><strong>TVA ({{tauxTVA}}%)</strong></td>
                <td><strong>{{montantTVA}} FCFA</strong></td>
              </tr>
              <tr>
                <td colspan="4"><strong>Total TTC</strong></td>
                <td><strong>{{totalTTC}} FCFA</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="payment-info">
          <p><strong>Mode de paiement:</strong> {{modePaiement}}</p>
          <p><strong>Échéance:</strong> {{dateEcheance}}</p>
          <p><strong>Référence:</strong> {{referencePaiement}}</p>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  {
    id: 'TPL-FIN-002',
    name: 'Reçu de paiement',
    description: 'Reçu pour les paiements effectués',
    documentType: 'reçu',
    category: 'financier',
    content: `
      <div class="receipt-template">
        <div class="header">
          <h2>REÇU DE PAIEMENT N° {{numeroRecu}}</h2>
          <p>Date: {{datePaiement}}</p>
        </div>
        
        <div class="payment-info">
          <div class="school-info">
            <h3>{{nomEcole}}</h3>
            <p>{{adresseEcole}}</p>
          </div>
          
          <div class="client-info">
            <p><strong>Reçu de:</strong> {{parentNom}}</p>
            <p><strong>Parent de:</strong> {{nomEleve}} {{prenomEleve}}</p>
            <p><strong>Classe:</strong> {{classe}}</p>
          </div>
        </div>
        
        <div class="payment-details">
          <p><strong>Montant reçu:</strong> {{montantRecu}} FCFA</p>
          <p><strong>Mode de paiement:</strong> {{modePaiement}}</p>
          <p><strong>Référence:</strong> {{referencePaiement}}</p>
          <p><strong>Motif:</strong> {{motifPaiement}}</p>
        </div>
        
        <div class="signature">
          <p>Le Caissier,</p>
          <div class="signature-space">
            <p>{{caissierNom}}</p>
            <p>{{caissierFonction}}</p>
          </div>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  {
    id: 'TPL-FIN-003',
    name: 'Rappel de paiement',
    description: 'Lettre de rappel pour les impayés',
    documentType: 'attestation',
    category: 'financier',
    content: `
      <div class="reminder-template">
        <div class="header">
          <h2>RAPPEL DE PAIEMENT</h2>
          <p>Référence: {{referenceFacture}}</p>
        </div>
        
        <div class="content">
          <p>Madame, Monsieur,</p>
          
          <p>Nous vous informons que le paiement de la facture ci-dessous n'a pas encore été effectué :</p>
          
          <div class="invoice-summary">
            <p><strong>Facture N°:</strong> {{numeroFacture}}</p>
            <p><strong>Date d'émission:</strong> {{dateFacture}}</p>
            <p><strong>Montant dû:</strong> {{montantDu}} FCFA</p>
            <p><strong>Échéance:</strong> {{dateEcheance}}</p>
            <p><strong>Délai de paiement dépassé:</strong> {{joursRetard}} jour(s)</p>
          </div>
          
          <p>Nous vous demandons de bien vouloir régulariser cette situation dans les plus brefs délais pour éviter :</p>
          <ul>
            <li>L'application de pénalités de retard</li>
            <li>La suspension des cours de votre enfant</li>
            <li>Des frais de recouvrement</li>
          </ul>
          
          <p>Vous pouvez effectuer votre paiement :</p>
          <ul>
            <li>Au secrétariat de l'établissement</li>
            <li>Par virement bancaire (RIB fourni)</li>
            <li>Par mobile money</li>
          </ul>
          
          <p>En cas de difficultés, n'hésitez pas à nous contacter.</p>
        </div>
        
        <div class="signature">
          <p>Cordialement,</p>
          <p><strong>{{comptableNom}}</strong></p>
          <p>Comptable</p>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  
  // Templates Autres
  {
    id: 'TPL-AUTRE-001',
    name: 'Attestation de stage',
    description: 'Attestation pour les stages et formations',
    documentType: 'attestation',
    category: 'autre',
    content: `
      <div class="stage-template">
        <div class="header">
          <h2>ATTESTATION DE STAGE</h2>
        </div>
        
        <div class="content">
          <p>Je soussigné(e), <strong>{{responsableNom}}</strong>, {{responsableFonction}} de l'établissement <strong>{{nomEcole}}</strong>, atteste que :</p>
          
          <div class="student-details">
            <p><strong>Nom et prénoms:</strong> {{nomEleve}} {{prenomEleve}}</p>
            <p><strong>Classe:</strong> {{classe}}</p>
            <p><strong>N° d'inscription:</strong> {{numeroInscription}}</p>
          </div>
          
          <p>a effectué un stage dans notre établissement du <strong>{{dateDebut}}</strong> au <strong>{{dateFin}}</strong>.</p>
          
          <div class="stage-details">
            <p><strong>Service d'accueil:</strong> {{serviceAccueil}}</p>
            <p><strong>Encadrant:</strong> {{encadrantNom}}</p>
            <p><strong>Durée:</strong> {{dureeStage}} jour(s)</p>
            <p><strong>Objectifs:</strong> {{objectifsStage}}</p>
          </div>
          
          <p>Pendant cette période, l'élève a fait preuve de :</p>
          <ul>
            <li>Ponctualité et assiduité</li>
            <li>Respect des consignes</li>
            <li>Motivation et sérieux</li>
            <li>Bonne intégration dans l'équipe</li>
          </ul>
          
          <p>Le présent document est délivré pour servir et valoir ce que de droit.</p>
        </div>
        
        <div class="signature">
          <p>Fait à {{ville}}, le {{dateEmission}}</p>
          <div class="signature-space">
            <p>{{responsableNom}}</p>
            <p>{{responsableFonction}}</p>
          </div>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  },
  {
    id: 'TPL-AUTRE-002',
    name: 'Lettre de recommandation',
    description: 'Lettre de recommandation pour les élèves',
    documentType: 'attestation',
    category: 'autre',
    content: `
      <div class="recommendation-template">
        <div class="header">
          <h2>LETTRE DE RECOMMANDATION</h2>
        </div>
        
        <div class="content">
          <p>À qui de droit,</p>
          
          <p>Je soussigné(e), <strong>{{directeurNom}}</strong>, {{directeurTitre}} de l'établissement <strong>{{nomEcole}}</strong>, recommande chaleureusement :</p>
          
          <div class="student-details">
            <p><strong>Nom et prénoms:</strong> {{nomEleve}} {{prenomEleve}}</p>
            <p><strong>Né(e) le:</strong> {{dateNaissance}}</p>
            <p><strong>Classe:</strong> {{classe}}</p>
            <p><strong>N° d'inscription:</strong> {{numeroInscription}}</p>
          </div>
          
          <p>Cet(te) élève a fréquenté notre établissement de <strong>{{dateEntree}}</strong> à <strong>{{dateSortie}}</strong> et s'est distingué(e) par :</p>
          
          <div class="qualities">
            <ul>
              <li><strong>Résultats scolaires:</strong> {{niveauScolaire}}</li>
              <li><strong>Comportement:</strong> {{comportement}}</li>
              <li><strong>Assiduité:</strong> {{assiduite}}</li>
              <li><strong>Relations avec les pairs:</strong> {{relationsPairs}}</li>
              <li><strong>Respect de l'autorité:</strong> {{respectAutorite}}</li>
            </ul>
          </div>
          
          <p>Au cours de sa scolarité, {{nomEleve}} a démontré :</p>
          <ul>
            <li>Un esprit d'initiative remarquable</li>
            <li>Une capacité d'adaptation excellente</li>
            <li>Un sens des responsabilités développé</li>
            <li>Une maturité au-dessus de la moyenne</li>
          </ul>
          
          <p>Je recommande vivement {{nomEleve}} pour {{motifRecommandation}} et suis convaincu(e) qu'il/elle saura faire honneur à votre institution.</p>
          
          <p>N'hésitez pas à me contacter pour tout renseignement complémentaire.</p>
        </div>
        
        <div class="signature">
          <p>Cordialement,</p>
          <div class="signature-space">
            <p><strong>{{directeurNom}}</strong></p>
            <p>{{directeurTitre}}</p>
            <p>{{nomEcole}}</p>
            <p>Tél: {{telephoneEcole}}</p>
            <p>Email: {{emailEcole}}</p>
          </div>
        </div>
      </div>
    `,
    lastModified: new Date().toISOString().split('T')[0],
    isDefault: true,
    isActive: true,
    createdBy: 'Système'
  }
];
