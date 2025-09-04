const { EmbedBuilder } = require("discord.js")
function displayEmbed({
    title, description, fields = [], image, thumbnail, footer, color = "Green"
}) {
    const embed = new EmbedBuilder().setColor(color);

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (fields.length) embed.addFields(fields);
    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter({ text: footer });

    return embed;
}
module.exports = displayEmbed;