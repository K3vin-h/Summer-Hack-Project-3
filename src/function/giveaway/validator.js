module.exports = {
 

    async checkRequirements(giveaway, member) {
      if (Array.isArray(giveaway.bypassRoles) && giveaway.bypassRoles.length > 0) {
        const hasBypassRole = giveaway.bypassRoles.some(roleId => member.roles.cache.has(roleId));
        if (hasBypassRole) return true;
      }
  
      if (giveaway.requiredRoleId && !member.roles.cache.has(giveaway.requiredRoleId)) {
        return false;
      }
  
      if (giveaway.requiredJoinServerId) {
        try {
          const requiredGuild = await member.client.guilds.fetch(giveaway.requiredJoinServerId);
          const fetchedMember = await requiredGuild.members.fetch(member.id).catch(() => null);
          if (!fetchedMember) return false;
        } catch (err) {
          member.client.logger?.warn?.(`Error checking required server: ${err.message}`);
          return false;
        }
      }
  
      return true;
    },
  

    calculateBonusEntries(giveaway, member) {
      let bonusEntries = 0;
  
      if (Array.isArray(giveaway.bonusEntries)) {
        for (const bonus of giveaway.bonusEntries) {
          if (member.roles.cache.has(bonus.roleId)) {
            bonusEntries += Number(bonus.entries) || 0;
          }
        }
      }
  
      return bonusEntries;
    },
  

    async getRequirementMessage(giveaway, member, client) {
      const missing = [];
  
      if (giveaway.requiredRoleId && !member.roles.cache.has(giveaway.requiredRoleId)) {
        missing.push(`• You must have the <@&${giveaway.requiredRoleId}> role`);
      }
  
      if (giveaway.requiredJoinServerId) {
        try {
          const guild = await client.guilds.fetch(giveaway.requiredJoinServerId);
          missing.push(`• You must join the server: **${guild.name}** (ID: \`${giveaway.requiredJoinServerId}\`)`);
        } catch {
          missing.push(`• You must join the server with ID: \`${giveaway.requiredJoinServerId}\``);
        }
      }
  
      return missing.length
        ? `You do not meet the following requirements to enter this giveaway:\n\n${missing.join('\n')}`
        : 'You meet all the requirements to enter this giveaway.';
    },
  
 
    validateGiveawayOptions(interaction, options) {
      const { prize, duration, winners } = options;
  
      if (!prize || typeof prize !== 'string' || prize.length > 256) {
        return { valid: false, message: 'Prize must be a string between 1 and 256 characters.' };
      }
  
      if (!duration || !this.isValidDuration(duration)) {
        return { valid: false, message: 'Invalid duration format. Use something like 1d, 2h, 30m.' };
      }
  
      if (typeof winners !== 'number' || winners < 1 || winners > 25) {
        return { valid: false, message: 'Number of winners must be between 1 and 25.' };
      }
  
      return { valid: true };
    },
  
 
    isValidDuration(duration) {
      return /^(\d+d)?(\d+h)?(\d+m)?$/.test(duration) && /\d/.test(duration);
    }
  };