const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const Giveaway = require('../../components/schema/giveaway');
const requirementsChecker = require('./validator');
const Log = require('../../components/schema/giveawayLogConfig')


module.exports = {

  async createGiveaway(interaction, client) {
    const options = interaction.options;
    const prize = options.getString('prize');
    const duration = options.getString('duration');
    const winners = options.getInteger('winners');
    const hosted = options.getUser('hosted') || interaction.user;
    const requiredRole = options.getRole('required_role');
    const requiredServer = options.getString('required_server');
    const bonusEntriesStr = options.getString('bonus_entries');
    const bypassRolesStr = options.getString('bypass_roles');
    const channel = options.getChannel('channel') || interaction.channel;

    if (!prize || prize.length > 256) {
      return interaction.reply({
        content: 'Prize must be between 1 and 256 characters long.',
        flags: MessageFlags.Ephemeral
      });
    }

    const durationMs = this.parseDuration(duration);
    if (durationMs === 0) {
      return interaction.reply({
        content: 'Invalid duration format. Use something like 1d, 2h, 30m',
        flags: MessageFlags.Ephemeral
      });
    }

    const endTime = new Date(Date.now() + durationMs);

    let guildName = "Unknown Server";
    let hostedTag = "Unknown";
    let creatorTag = "Unknown";

    try {
      const guild = await client.guilds.fetch(interaction.guild.id);
      guildName = guild.name;
    } catch (e) {
      console.warn('Failed to fetch guild name:', e.message);
    }

    try {
      const hostUser = await client.users.fetch(hosted.id);
      hostedTag = `${hostUser.username}`;
    } catch (e) {
      console.warn('Failed to fetch hosted user:', e.message);
    }

    try {
      const creatorUser = await client.users.fetch(interaction.user.id);
      creatorTag = `${creatorUser.username}`;
    } catch (e) {
      console.warn('Failed to fetch creator user:', e.message);
    }

    const giveawayData = {
      messageId: '',
      channelId: channel.id,
      guildId: interaction.guild.id,
      guildName,
      prize,
      hosted: hosted.id,
      hostedTag,
      winners: Math.min(Math.max(winners, 1), 25),
      createdAt: Date.now(),
      requiredRoleId: requiredRole?.id || null,
      requiredJoinServerId: requiredServer || null,
      bonusEntries: bonusEntriesStr ? this.parseBonusEntries(bonusEntriesStr) : [],
      bypassRoles: bypassRolesStr ? bypassRolesStr.split(',').map(id => id.trim()).filter(Boolean) : [],
      entries: [],
      ended: false,
      endTime,
      created: interaction.user.id,
      creatorTag
    };

    try {
      const giveaway = new Giveaway(giveawayData);
      const embed = await this.createGiveawayEmbed(giveaway, hosted.id, client);
      const joinButton = this.createJoinButton();

      const message = await channel.send({ embeds: [embed], components: [joinButton] });
      giveaway.messageId = message.id;

      await giveaway.save();

      const log = await Log.findOne({ guildId: interaction.guild.id });
      if (log?.channels?.giveawayCreate) {
        const guild = await client.guilds.fetch(interaction.guild.id);
        const logChannel = await guild.channels.fetch(log.channels.giveawayCreate);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Giveaway Created')
            .setDescription(`A new giveaway has been created. | [View Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`)
            .addFields(
              { name: 'Prize', value: giveaway.prize, inline: true },
              { name: 'Winner(s)', value: giveaway.winners.toString(), inline: true },
              { name: 'Ends', value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true },
              { name: 'Channel', value: `<#${channel.id}>`, inline: true },
              { name: 'Created By', value: `<@${interaction.user.id}> (${creatorTag})`, inline: false }
            )
            .setTimestamp();

          if (giveaway.requiredRoleId) {
            logEmbed.addFields({
              name: 'Required Role',
              value: `<@&${giveaway.requiredRoleId}>`,
              inline: true,
            });
          }

          if (giveaway.requiredJoinServerId) {
            try {
              const requiredGuild = await client.guilds.fetch(giveaway.requiredJoinServerId);
              logEmbed.addFields({
                name: 'Required Server',
                value: `${requiredGuild.name} (\`${requiredGuild.id}\`)`,
                inline: true,
              });
            } catch {
              logEmbed.addFields({
                name: 'Required Server',
                value: `Unknown Server (${giveaway.requiredJoinServerId})`,
                inline: true,
              });
            }
          }

          if (giveaway.bonusEntries.length > 0) {
            logEmbed.addFields({
              name: 'Bonus Entries',
              value: giveaway.bonusEntries
                .map(entry => `<@&${entry.roleId}>: +${entry.entries}`)
                .join('\n'),
              inline: false,
            });
          }

          if (giveaway.bypassRoles.length > 0) {
            logEmbed.addFields({
              name: 'Bypass Roles',
              value: giveaway.bypassRoles.map(id => `<@&${id}>`).join(', '),
              inline: false,
            });
          }

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      return interaction.reply({
        content: `Giveaway created in ${channel}!`,
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.error('Giveaway creation error:', error);
      return interaction.reply({
        content: 'An error occurred while creating the giveaway.',
        flags: MessageFlags.Ephemeral
      });
    }
  },


  parseDuration(duration) {
    let durationMs = 0;
    const durationRegex = /(\d+)([dhm])/g;
    let match;

    while ((match = durationRegex.exec(duration)) !== null) {
      const amount = parseInt(match[1]);
      const unit = match[2];
      if (unit === 'd') durationMs += amount * 24 * 60 * 60 * 1000;
      else if (unit === 'h') durationMs += amount * 60 * 60 * 1000;
      else if (unit === 'm') durationMs += amount * 60 * 1000;
    }

    return durationMs;
  },

  parseBonusEntries(bonusEntriesStr) {
    try {
      return bonusEntriesStr.split(',')
        .map(entry => entry.split(':'))
        .filter(([roleId, entriesCount]) => roleId && entriesCount && !isNaN(parseInt(entriesCount)))
        .map(([roleId, entriesCount]) => ({
          roleId: roleId.trim(),
          entries: parseInt(entriesCount)
        }));
    } catch (error) {
      console.error('Error parsing bonus entries:', error);
      return [];
    }
  },

  async createGiveawayEmbed(giveaway, hostId, client) {
    const totalParticipants = giveaway.entries.length;
    // const totalEntries = giveaway.entries.reduce((acc, e) => acc + e.entries, 0);

    const descriptionParts = [
      `**Winner(s):** ${giveaway.winners}`,
      `**Ends in:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>`,
      `**Hosted by:** <@${hostId}>`,
      `**Total Participants:** ${totalParticipants}`,
    ];

    // Add optional fields only if they exist
    if (giveaway.requiredRoleId) {
      descriptionParts.push(`**Required Role:** <@&${giveaway.requiredRoleId}>`);
    }
    if (giveaway.requiredJoinServerId) {
      try {
        const requiredGuild = await client.guilds.fetch(giveaway.requiredJoinServerId);
        descriptionParts.push(`**Must Join Server:** **${requiredGuild.name}** | (\`${requiredGuild.id}\`)`);
      } catch (err) {
        descriptionParts.push(`**Must Join Server:** ${giveaway.requiredJoinServerId}`);
      }

    }
    if (giveaway.bonusEntries.length > 0) {
      descriptionParts.push(`**Bonus Entries:**\n ${giveaway.bonusEntries.map(e => `<@&${e.roleId}>: **${e.entries}** entries`).join('\n')}`);
    }
    if (giveaway.bypassRoles.length > 0) {
      descriptionParts.push(`**Bypass Roles:** ${giveaway.bypassRoles.map(id => `<@&${id}>`).join('\n')}`);
    }
    return new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle(`${giveaway.prize}`)
      .setDescription(descriptionParts.length > 0 ? descriptionParts.join('\n') : ' ')
      .setFooter({ text: 'Click the button below to enter!' });

  },

  createJoinButton() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('giveaway_join')
          .setLabel('Join Giveaway')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('giveaway_leave')
          .setLabel('Leave Giveaway')
          .setStyle(ButtonStyle.Danger)
      );
  },

  async handleGiveawayJoin(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });



    try {
      const giveaway = await Giveaway.findOne({ messageId: interaction.message.id, ended: false });
      if (!giveaway) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF5555')
              .setTitle('Giveaway Unavailable')
              .setDescription('This giveaway has ended or does not exist.')
          ],
          flags: MessageFlags.Ephemeral
        });

      }
      const baseEntries = 1;
      const bonusEntries = requirementsChecker.calculateBonusEntries(giveaway, interaction.member);
      const totalEntries = baseEntries + bonusEntries;
      // Check if user already entered
      const existingEntry = giveaway.entries.find(entry => entry.userId === interaction.user.id);
      if (existingEntry) {
        if (totalEntries > existingEntry.entries) {
          // Update entry with increased total
          await this.updateUserEntries(giveaway, interaction.user.id, totalEntries);
          await this.updateGiveawayEmbed(giveaway, client);

          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#00CC66')
                .setTitle('Entry Updated')
                .setDescription(`Your giveaway entry has been updated to **${totalEntries} entries**.`)
                .addFields(
                  { name: 'Bonus Entries', value: bonusEntries > 0 ? 'Applied from your roles.' : 'None', inline: false },
                  { name: 'Jump to Giveaway', value: `🔗 [Click here to view](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`, inline: false }
                )
            ],
            flags: MessageFlags.Ephemeral
          });

        } else if (totalEntries < existingEntry.entries) {
          await this.updateUserEntries(giveaway, interaction.user.id, totalEntries);
          await this.updateGiveawayEmbed(giveaway, client);

          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#00CC66')
                .setTitle('Entry Updated')
                .setDescription(`Your giveaway entry has been updated to **${totalEntries} entries**.`)
                .addFields(
                  { name: 'Bonus Entries', value: bonusEntries > 0 ? 'Applied from your roles.' : 'None', inline: false },
                  { name: 'Jump to Giveaway', value: `🔗 [Click here to view](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`, inline: false }
                )
            ],
            flags: MessageFlags.Ephemeral
          });

        } else {
          return interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#FFAA00')
                .setTitle('Already Entered')
                .setDescription(`You already joined this giveaway with **${existingEntry.entries} ${existingEntry.entries === 1 ? 'entry' : 'entries'}**.`)
                .addFields(
                  { name: 'Tip', value: 'Get bonus roles to increase your chances!', inline: false },
                  { name: 'Jump to Giveaway', value: `🔗 [Click here to view](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`, inline: false }
                )
            ],
            flags: MessageFlags.Ephemeral
          });

        }
      }

      const meetsRequirements = await requirementsChecker.checkRequirements(giveaway, interaction.member);
      if (!meetsRequirements) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('Entry Denied')
              .setDescription(requirementsChecker.getRequirementMessage(giveaway, interaction.member, client))
              .addFields({ name: 'Jump to Giveaway', value: `🔗 [Click here to view](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`, inline: false })
          ],
          flags: MessageFlags.Ephemeral
        });

      }



      await this.updateUserEntries(giveaway, interaction.user.id, totalEntries);
      await this.updateGiveawayEmbed(giveaway, client);

      const log = await Log.findOne({ guildId: interaction.guild.id });
      if (log.channels.giveawayEntry != null) {

        const guild = await client.guilds.fetch(interaction.guild.id);
        const logChannel = await guild.channels.fetch(log.channels.giveawayEntry)
        if (logChannel) {
          const bonusRoles = giveaway.bonusEntries
            .filter(entry => interaction.member.roles.cache.has(entry.roleId))
            .map(entry => `<@&${entry.roleId}> (+${entry.entries})`)
            .join(', ') || 'None';

          const logEmbed = new EmbedBuilder()
            .setColor('#00FF66')
            .setTitle('New Giveaway Entry')
            .setDescription(`A user has joined a giveaway. | [View Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}) `)
            .addFields(
              { name: 'Giveaway', value: giveaway.prize, inline: false },
              { name: 'Participant', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Total Entries', value: `${totalEntries}`, inline: true },
              { name: 'Bonus Roles Used', value: bonusRoles, inline: false }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00AAFF')
            .setTitle('Entry Confirmed')
            .setDescription(`You’ve successfully entered the giveaway with **${totalEntries} ${totalEntries === 1 ? 'entry' : 'entries'}**.`)
            .addFields(
              { name: 'Bonus Entries', value: bonusEntries > 0 ? 'Applied from your roles.' : 'None', inline: false },
              { name: 'Jump to Giveaway', value: `🔗 [Click here to view](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`, inline: false }
            )
        ],
        flags: MessageFlags.Ephemeral
      });

    } catch (err) {
      console.error('Error handling giveaway join:', err);
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Error')
            .setDescription('An error occurred while joining the giveaway. Please try again later.')
        ],
        flags: MessageFlags.Ephemeral
      });

    }
  },
  async handleGiveawayLeave(interaction, client) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const giveaway = await Giveaway.findOne({ messageId: interaction.message.id, ended: false });
      if (!giveaway) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Giveaway Not Found')
          .setDescription('This giveaway has ended or does not exist.')
          .setTimestamp();

        return interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
      }

      const entryIndex = giveaway.entries.findIndex(entry => entry.userId === interaction.user.id);
      if (entryIndex === -1) {
        const warnEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('Not Entered')
          .setDescription('You have not entered this giveaway.')
          .setTimestamp();

        return interaction.editReply({ embeds: [warnEmbed], flags: MessageFlags.Ephemeral });
      }

      // Remove user entry
      giveaway.entries.splice(entryIndex, 1);
      await giveaway.save();

      // Update giveaway embed
      await this.updateGiveawayEmbed(giveaway, client);

      // Log the leave event
      const log = await Log.findOne({ guildId: interaction.guild.id });
      if (log?.channels?.giveawayLeave) {
        const guild = await client.guilds.fetch(interaction.guild.id);
        const logChannel = await guild.channels.fetch(log.channels.giveawayLeave);
        if (logChannel) {
          const bonusRoles = giveaway.bonusEntries
            .filter(entry => interaction.member.roles.cache.has(entry.roleId))
            .map(entry => `<@&${entry.roleId}> (+${entry.entries})`)
            .join(', ') || 'None';

          const jumpLink = `https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId}`;

          const logEmbed = new EmbedBuilder()
            .setColor('#FF6666')
            .setTitle('Giveaway Leave')
            .setDescription(`A user has left a giveaway. | [View Giveaway](${jumpLink})`)
            .addFields(
              { name: 'Giveaway', value: giveaway.prize, inline: false },
              { name: 'Participant', value: `<@${interaction.user.id}>`, inline: true },
              { name: 'Bonus Roles Used', value: bonusRoles, inline: false }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

      const successEmbed = new EmbedBuilder()
        .setColor('#00CC66')
        .setTitle('Left Giveaway')
        .setDescription(`You have successfully left the giveaway for **${giveaway.prize}**.`)
        .setTimestamp();

      return interaction.editReply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });

    } catch (error) {
      console.error('Error leaving giveaway:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error')
        .setDescription('An unexpected error occurred while trying to leave the giveaway.')
        .setTimestamp();

      return interaction.editReply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
    }
  },


  async updateUserEntries(giveaway, userId, entries) {
    try {
      const existingEntryIndex = giveaway.entries.findIndex(entry => entry.userId === userId);

      if (existingEntryIndex !== -1) {
        giveaway.entries[existingEntryIndex].entries = entries;
      } else {
        giveaway.entries.push({ userId, entries });
      }

      await giveaway.save();
    } catch (error) {
      console.error('Error updating user entries:', error);
      throw error;
    }
  },

  async updateGiveawayEmbed(giveaway, client) {
    try {
      const guild = await client.guilds.fetch(giveaway.guildId);
      const channel = await guild.channels.fetch(giveaway.channelId);
      const message = await channel.messages.fetch(giveaway.messageId);

      const totalParticipants = giveaway.entries.length;
      // const totalEntries = giveaway.entries.reduce((acc, e) => acc + e.entries, 0);

      // Rebuild embed using existing embed but update description
      const embed = new EmbedBuilder(message.embeds[0]);

      // Rebuild description (similar to createGiveawayEmbed but based on current data)
      const descriptionParts = [
        `**Winner(s) ** ${giveaway.winners}`,
        `**Ends in:** <t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>`,
        `**Total Participants:** ${totalParticipants}`,
        `**Hosted by:** <@${giveaway.hosted}>`, // Hosted by (preserves it)
        ''
      ];

      if (giveaway.requiredRoleId) {
        descriptionParts.push(`**Required Role:** <@&${giveaway.requiredRoleId}>`);
      }
      if (giveaway.requiredJoinServerId) {
        try {
          const requiredGuild = await client.guilds.fetch(giveaway.requiredJoinServerId);
          descriptionParts.push(`**Must Join Server:** **${requiredGuild.name}** | (\`${requiredGuild.id}\`)`);
        } catch (err) {
          descriptionParts.push(`**Must Join Server:** ${giveaway.requiredJoinServerId}`);
        }
      }
      if (giveaway.bonusEntries.length > 0) {
        descriptionParts.push(`**Bonus Entries:**\n ${giveaway.bonusEntries.map(e => `<@&${e.roleId}>: **${e.entries}** entries`).join('\n')}`);
      }
      if (giveaway.bypassRoles.length > 0) {
        descriptionParts.push(`**Bypass Roles:** ${giveaway.bypassRoles.map(id => `<@&${id}>`).join('\n')}`);
      }

      embed.setDescription(descriptionParts.join('\n'));

      await message.edit({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to update giveaway embed:', error);
    }
  },

  async endGiveaway(interaction, giveaway, client, endedManually = false, endedBy = null) {
    try {
      const guild = await client.guilds.fetch(giveaway.guildId);
      const channel = await guild.channels.fetch(giveaway.channelId);
      const message = await channel.messages.fetch(giveaway.messageId);

      // Process entries
      const participants = new Set();
      const validEntries = [];

      for (const entry of giveaway.entries) {
        try {
          const member = await guild.members.fetch(entry.userId);
          const isValid = await requirementsChecker.checkRequirements(giveaway, member);
          if (isValid) {
            participants.add(entry.userId);
            for (let i = 0; i < entry.entries; i++) {
              validEntries.push(entry.userId);
            }
          }
        } catch (err) {
          client.logger.debug(`User ${entry.userId} not found in guild ${guild.id}`);
        }
      }

      // Select winners
      const winners = [];
      const uniqueEntries = [...new Set(validEntries)];

      for (let i = 0; i < giveaway.winners && uniqueEntries.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * uniqueEntries.length);
        winners.push(uniqueEntries[randomIndex]);
        uniqueEntries.splice(randomIndex, 1);
      }

      // Update database
      giveaway.ended = true;
      giveaway.endTime = new Date();
      await giveaway.save();

      // Create participants list (chunked to avoid embed field limits)
      const participantList = Array.from(participants).map(id => `<@${id}>`);
      const participantChunks = [];
      while (participantList.length > 0) {
        participantChunks.push(participantList.splice(0, 20).join(', '));
      }

      // Update giveaway message


      const embed = new EmbedBuilder(message.embeds[0])
        .setColor('#FF0000')
        .setTitle(`${giveaway.prize}`)
        .setDescription(
          `**Winner(s):** ${winners.map(id => `<@${id}>`).join(', ') || 'No valid participants'}\n` +
          `**Total Participants:** ${participants.size}\n` +
          `**Hosted by:** <@${giveaway.hosted}>`

        )
        .setFooter({ text: `Giveaway ended at ${new Date()}` });

      if (endedManually && endedBy) {
        embed.addFields({
          name: 'Ended Early By',
          value: `<@${endedBy}>`,
          inline: true,
        });
      }



      const components = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('giveaway_join')
            .setLabel('Ended')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
        );

      await message.edit({ embeds: [embed], components: [components] });

      if (winners.length > 0) {
        const winnerEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('Giveaway Ended')
          .setDescription(
            `**Prize:** ${giveaway.prize}\n` +
            `**Winner(s):** ${winners.map(id => `<@${id}>`).join(', ')}\n` +
            `**Total Participants:** ${participants.size}\n` +
            `**Hosted by:** <@${giveaway.hosted}>\n\n` +
            `🔗 [Jump to Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`
          )
          .setTimestamp();


        await channel.send({
          content: `${endedManually ? 'Giveaway ended early! ' : ''} Winner(s): ${winners.map(id => `<@${id}>`).join(', ')}`,
          embeds: [winnerEmbed],
        });
      } else {
        const noWinnerEmbed = new EmbedBuilder()
          .setColor('#FF5555')
          .setTitle('Giveaway Ended')
          .setDescription(
            `**Prize:** ${giveaway.prize}\n` +
            `**No valid participants.**\n` +
            `**Total Entries Attempted:** ${giveaway.entries.length}\n\n` +
            `🔗 [Jump to Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`
          )
          .setTimestamp();

        await channel.send({
          embeds: [noWinnerEmbed]
        });
      }

      const log = await Log.findOne({ guildId: interaction?.guild?.id || giveaway.guildId });

      if (log.channels.giveawayEnd != null) {
        const logChannel = await guild.channels.fetch(log.channels.giveawayEnd)
        if (logChannel != null) {
          const durationMs = giveaway.endTime - giveaway.createdAt;
          const durationFormatted = this.formatDuration(durationMs);

          let footerText = `Giveaway ended at ${new Date().toLocaleString()}`;
          if (endedManually && endedBy) {
            try {
              const user = await client.users.fetch(endedBy);
              footerText += ` | Ended by ${user.tag} (${endedBy})`;
            } catch {
              footerText += ` | Ended by <@${endedBy}> (${endedBy})`;
            }
          }

          const logEmbed = new EmbedBuilder()
            .setColor(endedManually ? '#ff9900' : '#ff0000')
            .setTitle(`Giveaway Ended ${endedManually ? '(Manually)' : ''}`)
            .setDescription(`**Prize:** ${giveaway.prize} | [View Giveaway](https://discord.com/channels/${giveaway.guildId}/${giveaway.channelId}/${giveaway.messageId})`)
            .addFields(
              { name: 'Winner(s)', value: winners.length > 0 ? winners.map(id => `<@${id}>`).join(', ') : 'None', inline: true },
              { name: 'Participants', value: participants.size.toString(), inline: true },
              { name: 'Total Valid Entries', value: validEntries.length.toString(), inline: true },
              { name: 'Duration', value: `${durationFormatted}`, inline: true }
            )
            .setFooter({ text: footerText })
            .setTimestamp();


          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.log(error)
      client.logger.error(`Error ending giveaway ${giveaway.messageId}:`, error);
      try {
        giveaway.ended = true;
        await giveaway.save();
      } catch (dbError) {
        client.logger.error('Failed to update giveaway status in DB:', dbError);
      }
    }
  },
  formatDuration(ms) {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    let parts = [];
    if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

    return parts.join(', ');
  },
};