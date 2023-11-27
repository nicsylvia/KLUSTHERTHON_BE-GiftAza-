import nodemailer from "nodemailer";
import { google } from "googleapis";
import path from "path";
import ejs from "ejs";

const GOOGLE_ID =
  "711746264327-ib9iaq9rb83o7p91inap2a47o3uirrbj.apps.googleusercontent.com";
const GOOGLE_SECRET = "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";

const GOOGLE_REDIRECT = "https://developers.google.com/oauthplayground";
const REFRESH =
  "1//04-3AwTjrEjYuCgYIARAAGAQSNwF-L9IrLZoaBCv22bphet8kwNV6rx1dVlYJZ44KQK_fAtkT1o7F4eT1qkn5_FhyjycjNTpSbm4";

const oAuth = new google.auth.OAuth2(GOOGLE_ID, GOOGLE_SECRET, REFRESH);
oAuth.setCredentials({ refresh_token: REFRESH });

const url = `https://giftaza.vercel.app`;

export const verifyUserEmailByAdmin = async (user: any, admin: any) => {
  try {
    const accessToken: any = await oAuth.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "easyhrplayform@gmail.com",
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: REFRESH,
        accessToken: accessToken.token,
      },
    });

    const getData = path.join(__dirname, "../../Views/AdminUserSignup.ejs");

    const readData = await ejs.renderFile(getData, {
      companyName: admin.companyName,
      name: user?.name,
      adminname: admin?.name,
      id: user?._id,
      url: `${url}/api/staff/${user?._id}/verification`,
    });

    let mailerOptions = {
      from: "GiftAza Team",
      to: admin?.email,
      subject: "Staff Email Verification",
      html: readData,
    };

    transporter
      .sendMail(mailerOptions)
      .then(() => {
        console.log("Email sent!");
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    throw error;
  }
};

export const verifyUserEmail = async (user: any) => {
  try {
    const accessToken: any = await oAuth.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "easyhrplayform@gmail.com",
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: REFRESH,
        accessToken: accessToken.token,
      },
    });

    const getData = path.join(__dirname, "../../Views/UserSignUp.ejs");

    const readData = await ejs.renderFile(getData, {
      name: user?.name,
      email: user?.email,
      id: user?._id,
    });

    let mailerOptions = {
      from: "GiftAza Team",
      to: user?.email,
      subject: "Email Verification",
      html: readData,
    };

    transporter
      .sendMail(mailerOptions)
      .then(() => {
        console.log("Email sent!");
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    throw error;
  }
};

export const finalVerifyUserEmail = async (user: any) => {
  try {
    const accessToken: any = await oAuth.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "easyhrplayform@gmail.com",
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: REFRESH,
        accessToken: accessToken.token,
      },
    });

    const getData = path.join(
      __dirname,
      "../../Views/FinalUserVerification.ejs"
    );

    const readData = await ejs.renderFile(getData, {
      name: user?.name,
      companyname: user?.companyName,
      email: user?.email,
      OTP: user?.token,
      id: user?._id,

      url: `${url}/${user?._id}/checkotp`,
    });

    let mailerOptions = {
      from: "easyhrplayform@gmail.com",
      to: user?.email,
      subject: "Email Verification",
      html: readData,
    };
    transporter
      .sendMail(mailerOptions)
      .then(() => {
        console.log("Email sent!");
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    throw error;
  }
};

export const finalVerifyAdminEmail = async (user: any, admin: any) => {
  try {
    const accessToken: any = await oAuth.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "easyhrplayform@gmail.com",
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: REFRESH,
        accessToken: accessToken.token,
      },
    });

    const getData = path.join(
      __dirname,
      "../../Views/FinalAdminStaffVerification.ejs"
    );
    const readData = await ejs.renderFile(getData, {
      name: user?.name,
      companyname: admin?.name,

      id: user?._id,
      // url: `${staffURL}/${staff?._id}/activateaccount`,
    });

    let mailerOptions = {
      from: "easyhrplayform@gmail.com",
      to: admin?.email,
      subject: "Email Verification",
      html: readData,
    };

    transporter
      .sendMail(mailerOptions)
      .then(() => {
        console.log("Email sent!");
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    throw error;
  }
};
