import nodemailer from "nodemailer";
import { google } from "googleapis";
import path from "path";
import ejs from "ejs";

const GOOGLE_ID =
  "24372524741-jn16e1i5tcijldtr4ipcn55rtje4am4j.apps.googleusercontent.com";
const GOOGLE_SECRET = "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K";

const GOOGLE_REDIRECT = "https://developers.google.com/oauthplayground";
const REFRESH =
  "1//04EWZpRgB9b_LCgYIARAAGAQSNwF-L9Ir41mPdg9pgd8bDI5PhhcFOTaC07cMJnNe0TlmJ1TAdmlNypzlNRH0A5GbBysKKztA6Kk";

const oAuth = new google.auth.OAuth2(GOOGLE_ID, GOOGLE_SECRET, REFRESH);
oAuth.setCredentials({ refresh_token: REFRESH });

export const verifyUserEmailByAdmin = async (user: any, admin: any) => {
  try {
    const accessToken: any = await oAuth.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nicsylvia15f@gmail.com",
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: REFRESH,
        accessToken: accessToken.token,
      },
    });

    let mailerOptions = {
      from: "nicsylvia15f@gmail.com",
      to: admin?.email,
      subject: "User Email Verification",
      html: `${admin?.companyName} , this is to inform you that <b>${user?.name} </b> wants to make a purchase`,
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
        user: "nicsylvia15f@gmail.com",
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: REFRESH,
        accessToken: accessToken.token,
      },
    });

    let mailerOptions = {
      from: "nicsylvia15f@gmail.com",
      to: user?.email,
      subject: "Email Verification",
      html: `<div>Thanks for signing up ${user?.name} to make purchase , the business will notify you when your request has been accepted </div>`,
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
        user: "nicsylvia15f@gmail.com",
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: REFRESH,
        accessToken: accessToken.token,
      },
    });

    let mailerOptions = {
      from: "nicsylvia15f@gmail.com",
      to: user?.email,
      subject: "Email Verification",
      html: `Hi!!! ${user?.name} , your request has been accepted , use this token to sign in to continue ${user?.token}`,
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
        user: "nicsylvia15f@gmail.com",
        type: "OAuth2",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: REFRESH,
        accessToken: accessToken.token,
      },
    });

    let mailerOptions = {
      from: "nicsylvia15f@gmail.com",
      to: admin?.email,
      subject: "Email Verification",
      html: `<div> This is to Inform you that <strong>${user?.name} </strong> is now a member of your staff as Approved by you!</div>`,
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
