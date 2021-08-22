import React from "react";
import useTranslation from "next-translate/useTranslation";
import NextSeoHead from "src/components/NextSeoHead";
import { GetStaticProps } from "next";
import styles from "./about.module.scss";

const About = () => {
  const { t } = useTranslation();
  const quranCom = t("common:Quran-com");
  const description = t("about:description");

  return (
    <div className={styles.container}>
      <NextSeoHead title={t("about:title")} />
      <h1 className={styles.aboutHeader}>{quranCom}</h1>
      <h3 className={styles.aboutDescription}>{description}</h3>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => ({
  props: {},
});

export default About;
