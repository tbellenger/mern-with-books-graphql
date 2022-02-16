const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select("-__v -password")
          .populate("books");

        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, args, context) => {
      if (context.user) {
        console.log("in save book");
        const user = User.findOneAndUpdate(
          { username: context.user.username },
          { $addToSet: { savedBooks: args } },
          { new: true, runValidators: true }
        );
        return user;
      }
      console.log("login error");
      throw new AuthenticationError("You need to be logged in");
    },
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const user = User.findOneAndUpdate(
          { username: context.user.username },
          { $pull: { savedBooks: { bookId: args.bookId } } },
          { new: true }
        );
        return user;
      }
      console.log("login error");
      throw new AuthenticationError("You need to be logged in");
    },
  },
};

module.exports = resolvers;
