const createTokenUser = ({ payload }) => {
    const { name, _id: userId, role, theme, isVerified, email } = payload;
    return { name, userId, role, theme, isVerified, email };
};

module.exports = createTokenUser;
