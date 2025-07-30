Widget de Chat pour n8n
Ce script vous permet d'intégrer facilement un widget de chat moderne sur n'importe quel site web, connecté à une automatisation n8n.

Installation
L'installation ne nécessite qu'une seule ligne de code à ajouter à votre site web.

Copiez la ligne de code ci-dessous.

Collez-la sur votre site, juste avant la balise de fermeture </body>.

Remplacez URL_DE_VOTRE_WEBHOOK_N8N par votre propre URL de webhook n8n.

Code d'intégration
<script src="https://VOTRE_NOM_UTILISATEUR.github.io/NOM_DE_VOTRE_DEPOT/chat-widget.js" 
        data-n8n-url="URL_DE_VOTRE_WEBHOOK_N8N" 
        defer>
</script>

Important :

Assurez-vous de remplacer VOTRE_NOM_UTILISATEUR et NOM_DE_VOTRE_DEPOT par les vôtres. Le lien doit pointer vers le fichier chat-widget.js brut sur GitHub Pages.

L'attribut defer est important, il s'assure que le script se charge sans bloquer l'affichage de votre page.

Comment ça marche ?
Le script va automatiquement :

Créer le bouton de chat flottant.

Injecter les styles nécessaires pour le widget.

Gérer l'ouverture, la fermeture et l'envoi des messages vers votre webhook n8n.

Toutes les mises à jour du style ou du comportement du widget seront automatiquement répercutées sur votre site sans que vous ayez à changer quoi que ce soit.
