module.exports = {
	async studentMedical(parents, args, { userId, query }, info) {
		if (!userId) throw Error('theres a problemo señor');

		const medical = await query.medicalCondition({ where: { student: { id: userId } } }, info);

		return medical;
	}
};
