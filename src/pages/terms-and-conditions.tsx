/* eslint-disable max-lines */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

const PATH = '/terms-and-conditions';
const TermsAndConditionsPage: NextPage = (): JSX.Element => {
  const { t, lang } = useTranslation('common');

  return (
    <>
      <NextSeoWrapper
        title={t('terms-and-conditions')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
      />
      <PageContainer>
        <div className={styles.contentPage}>
          <h2>END USER SOFTWARE LICENSE AND TERMS OF SERVICE AGREEMENT</h2>
          <p>
            THIS TERMS OF SERVICE AGREEMENT IS A LEGAL AND BINDING AGREEMENT BETWEEN YOU
            ("YOU,""YOUR" OR "YOURSELF") AND Quran.com ("OUR,""US,""WE" OR " Quran.com"), WHICH
            GOVERNS YOUR USE OF OUR MOBILE APPLICATIONS, WEBSITES AND ALL INTERNET-BASED SERVICE
            TOGETHER WITH ALL INFORMATION, CONTENT, PRODUCTS, MATERIALS AND SERVICES MADE AVAILABLE
            TO YOU THROUGH THE SAME BY US AND/OR THIRD PARTIES (COLLECTIVELY,"THE SERVICE").
          </p>
          <p>
            PLEASE READ THIS AGREEMENT CAREFULLY BEFORE USING THE SERVICE. BY CLICKING THE "ACCEPT"
            BUTTON, DOWNLOADING OR USING THE Quran.com MOBILE APPLICATION, (THE "MOBILE
            APPLICATION"), REGISTERING FOR AN ACCOUNT ON THE SERVICE, OR OTHERWISE ACCESSING THE
            SERVICE, OR ANY COMPONENT THEREOF, IN ANY MANNER WHATSOEVER, YOU ARE CONSENTING TO
            BECOME A PARTY TO THIS AGREEMENT AND AGREEING TO BE BOUND BY AND COMPLY WITH THE TERMS
            AND CONDITIONS HEREIN.
          </p>
          <p>
            IF YOU DO NOT AGREE TO THE TERMS OF THIS AGREEMENT, DO NOT CLICK THE "ACCEPT" BUTTON AND
            YOU MAY NOT USE THE Quran.com MOBILE APPLICATION TO WHICH THIS AGREEMENT APPLIES.
            Quran.com is provided and managed by Quran Foundation, Inc. Anytime Quran.com is
            mentioned it is also referring to Quran Foundation, Inc.
          </p>
          <h2>0. GENERAL</h2>
          <p>
            0.1 Quran.com HAS A 0 TOLERANCE POLICY FOR ABUSIVE, SEXUAL, OR QUESTIONABLE CONTENT.
            ABUSIVE USERS OR USERS WHO POST SAID CONTENT WILL BE PERMANENTLY BANNED.
          </p>
          <p>
            0.2 The opinions and ideas expressed by users are solely their own and do not
            necessarily reflect the views of Quran.com or Quran Foundation, Inc.
          </p>
          <p>
            0.3 By posting your notes and reflections on QuranReflect you are agreeing to
            QuranReflect’s Terms and Conditions: https://quranreflect.com/terms_and_conditions
          </p>
          <h2>1. SERVICE (GENERAL).</h2>
          <p>
            1.1 The Service shall include, without limitation (i) the Quran.com Mobile Application,
            together with various other Quran.com powered mobile applications and certain
            third-party integrated mobile device software applications, and including any software
            code, scripts, interfaces, graphics, displays, text, documentation and other components;
            (ii) any updates, modifications or enhancements to the items listed in subsection (i);
            and (iii) any of the Internet-based, interactive information services, general and
            personalized content, and interactive tools provided by Quran.com that may be used or
            accessible by means of the Mobile Application or via our websites.
          </p>
          <p>
            1.2 The Mobile Application, is licensed, not sold, to you by Quran.com. Your use of the
            Mobile Application must be made in strictly in accordance with this Agreement and the
            applicable usage rules established by any third party mobile device platform or service
            provider or the third party from whom you are downloading the Mobile Application (as
            defined in section 1.2) that relate to your Mobile Device (as defined in section 2.1)
            ("Usage Rules"), which are incorporated herein by reference. Certain Usage Rules are
            described in Section 22 of this Agreement, however, it is your responsibility to
            determine what Usage Rules apply to your use of the Mobile Application and Services, as
            they may be applicable to you depending on (i) your Mobile Device, (ii) the method by
            which you downloaded the Mobile Application or accessed the preloaded Mobile
            Application, and (iii) the third party from whom you downloaded the Mobile Application
            or accessed the preloaded Mobile Application.
          </p>
          <p>
            1.3 Our websites, each of which I subject to the terms and conditions of this Agreement,
            include those found at http://quran.com, without limitation.
          </p>
          <p>
            1.4 As part of the Service, we use a diverse range of proprietary and authorized third
            party information, listings, directories, text, advertisements, User Generated Content
            (as defined herein), photographs, designs, graphics, images, sound and video recordings,
            animation and other material and effects (which we collectively call the "Content")
            available by means of the Service FOR YOUR PERSONAL, NON-COMMERCIAL USE ONLY.
            Accordingly, you may view, use, copy, and distribute the Content obtained by means of
            the Service for individual, noncommercial, informational purposes only and in compliance
            with this Agreement and all applicable laws.
          </p>
          <p>
            1.5 You affirm that you are either more than 18 years of age, or an emancipated minor,
            or possess legal parental or guardian consent, and are fully able and competent to enter
            into the terms, conditions, obligations, affirmations, representations, and warranties
            set forth in this Agreement, and to abide by and comply with this Agreement. In any
            case, you affirm that you are over the age of 13, as the Service is not intended for
            children under 13. If you are under 13 years of age, then please do not use the Service.
            You may not order or register as a user if you are under 18 years of age. You further
            agree that you are not otherwise prohibited from using the Service or consenting to this
            Agreement. If you are not able to make the representations set forth in this section,
            you are prohibited from accepting this Agreement and using the Service.
          </p>
          <p>
            1.6 We recommend you retain a copy of this Agreement in either electronic or tangible
            format for your subsequent reference. You can access a web-based version of this
            Agreement by visiting quran.com/terms-and-conditions.
          </p>
          <p>
            1.7 This Agreement and your use of the Service is conditioned upon your agreement with
            the terms of our Privacy Policy. You can access a web based version of our Privacy
            Policy by visiting https://quran.com/privacy
          </p>
          <h2>2. MOBILE APPLICATION LICENSE GRANT AND RESTRICTIONS ON USE OF THE SERVICE.</h2>
          <p>
            2.1 Quran.com grants You a revocable, non-exclusive, non-transferrable, limited right to
            install and use the Mobile Application on a single mobile telephone or device controlled
            by you (each a "Mobile Device"), and to access and use the Service on such Mobile Device
            or via our websites strictly in accordance with the terms and conditions of this
            Agreement.
          </p>
          <p>
            2.2 You shall not: (i) decompile, reverse engineer, disassemble, attempt to derive the
            source code of, or decrypt the Mobile Application or Service; (ii) make any
            modification, adaptation, improvement, enhancement, translation or derivative work from
            the Mobile Application or Service; (iii) violate any applicable laws, rules or
            regulations in connection with your access or use of the Service; (iv) remove, alter or
            obscure any proprietary notice (including any notice of copyright or trademark) of
            Quran.com or its affiliates, partners, suppliers or the licensors of the Service or
            otherwise obscure or modify the any manner in which the Service is displayed by means of
            the Mobile Application or our websites; (v) install, use or permit the Mobile
            Application to exist on more than one Mobile Device at a time or on any other mobile
            device or computer, other than by means of your separate downloads of the Mobile
            Application, each of which are subject to a separate license (this restriction however
            does not limit your right to reinstall the Mobile Application on the specific Mobile
            Device for which it was downloaded); (vi) distribute or link the Service to multiple
            Mobile Devices or other services; (vii) make the Service available over a network or
            other environment permitting access or use by multiple Mobile Devices or users at the
            same time; (viii) use the Service for data mining, scraping, crawling, redirecting, or
            compiling a collection of listings or data for any purpose (including, without
            limitation, for use by a listing product or listing service that is, directly or
            indirectly, competitive with or in any way a substitute for any services offered by
            Quran.com) other than one authorized pursuant to this Agreement; (ix) use the Service to
            send automated queries or to send any unsolicited commercial e-mail; (x) use the Service
            to attempt to interfere with the proper functioning and display of the proper operation
            and usage of the Service or our websites by any other authorized users and third
            parties; or (xi) use any proprietary information or interfaces of the Service or other
            intellectual property for any reason.
          </p>
          <p>
            2.3 You agree that you will not use the Service for any revenue generating endeavor,
            commercial enterprise, or other purpose for which it is not designed or intended (except
            that Quran.com and its affiliates and their respective employees are expressly permitted
            to use the Service for the internal business purposes of Quran.com and its affiliates).
            By using the Service, you agree you will not copy, reproduce, alter, modify, create
            derivative works from, rent, lease, loan, sell, distribute or publicly display any of
            the Content (except for your own personal, non commercial use) accessed by the Service
            without the prior written consent of Quran.com. In addition, you will not use the
            Content for any unauthorized non-commercial marketing and promotional campaigns, target
            or mass solicitation campaigns or political campaigning. YOU ACKNOWLEDGE THAT YOUR USE
            OF THE SERVICE TO ENABLE THE TRANSMISSION OF UNSOLICITED VOICE MESSAGES, FACSIMILES OR
            EMAILS IS IN VIOLATION OF THIS AGREEMENT AND MAY BE IN VIOLATION OF UNITED FEDERAL AND
            STATE LAWS AND REGULATIONS.
          </p>
          <p>
            2.4 Some or all of the Service may be provided by an affiliate or subsidiary of
            Quran.com or a third party, and you may be subject to both this Agreement and the terms
            of service of that third party. Certain portions of the Service may utilize or include
            third party software that is subject to open source and third party license terms
            ("Third Party Software"). You acknowledge and agree that your right to use such Third
            Party Software as part of, or in connection with, any Mobile Application or the internet
            is subject to and governed by the terms and conditions of the open source or third party
            license applicable to such Third Party Software, including, without limitation, any
            applicable acknowledgements, license terms and disclaimers contained therein. In the
            event of a conflict between the terms of this Agreement and the terms of such open
            source or third party licenses with regard to your use of the relevant Third Party
            Software, the terms of the open source or third party licenses shall control. In no
            event shall the Service or components thereof be deemed to be "open source" or "publicly
            available" software.
          </p>
          <p>
            2.5 Quran.com does not warrant that the Service will be compatible or interoperable with
            your Mobile Device or any other piece of hardware, software, equipment or device
            installed on or used in connection with your Mobile Device or used to otherwise access
            our websites. You acknowledge and agree that Quran.com and its affiliates, partners,
            suppliers and licensors shall have no liability to you for any losses suffered resulting
            from or arising in connection with compatibility or interoperability problems.
          </p>
          <p>
            2.6 You acknowledge that you are responsible for addressing any third party claims
            relating to your use of the Service, and agree to notify Quran.com of any third party
            claims relating to the Service of which you become aware. Furthermore, you hereby
            release Quran.com from any liability resulting from your use of the Service, including,
            without limitation, the following: (i) any product liability claims; (ii) any claim that
            the Service fails to conform to any applicable legal or regulatory requirement; and
            (iii) any claim arising under consumer protection or similar legislation.
          </p>
          <p>
            2.7 You may not use or otherwise export or re-export the Service except as authorized by
            United States law and the laws of the jurisdiction(s) in which any Service was obtained.
            You represent and warrant that You are not (i) located in any country that is subject to
            a U.S. Government embargo, or that has been designated by the U.S. Government as a
            "terrorist sponsoring" country, or (ii) listed on any U.S. Government list of prohibited
            or restricted parties including the Treasury Department's list of Specially Designated
            Nationals or the U.S. Department of Commerce Denied Person's List or Entity List. You
            also agree that you will not use the Service for any purposes prohibited by United
            States law.
          </p>
          <p>
            2.8 You acknowledge that Quran.com may from time to time issue upgraded versions of the
            Service, and may automatically electronically upgrade the version of the Mobile
            Application that you are using on your Mobile Device. You consent to such automatic
            upgrading on your Mobile Device, and agree that this Agreement will apply to all such
            upgrades.
          </p>
          <p>
            2.9 From time to time and without prior notice to you, we may change, expand and improve
            the Service. We may also, at any time, cease to continue operating part or all of the
            Service or selectively disable certain aspects of the Service or portions of the Service
            accessible by the Mobile Application and/or our websites. Any modification or
            elimination of the Service will be done in our sole and absolute discretion and without
            an ongoing obligation or liability to you. Your use of the Service does not entitle you
            to the continued provision or availability of the Service.
          </p>
          <h2>3. YOUR USE OF THE SERVICE.</h2>
          <p>
            3.1 You acknowledge and understand that certain portions of the Service may require and
            utilize phone service, internet access, data access or text messaging capability. Except
            as otherwise noted, Quran.com does not charge for the use of Service, but carrier rates
            for phone, internet, data and text messaging may apply and you are responsible for any
            such charges, as well as, internet and pay any service fees associated with such access.
            In addition, you must provide all equipment necessary to make such connection to the
            internet and to be able to access our websites.
          </p>
          <p>
            3.2 The functional use of the Service may be dependent on the data related to your
            geographic location and geopositional data, and you acknowledge and agree that your
            failure to provide (or make accessible) that data may limit the functionality of the
            Service. Quran.com makes no warranty with respect to the accuracy of Service provided to
            you in reliance on location and geopositional data provided by you, the Mobile
            Application or via your Mobile Device or our websites.
          </p>
          <p>
            3.3 In providing the Service, we do not actively monitor the display, transmission and
            exchange of Content that is accessible by means of the Service, nor do we maintain any
            obligation to do so except as otherwise determined by us or required by the laws of
            applicable jurisdictions. However, subject to the terms of our Privacy Policy, we
            reserve the right to monitor the Service for purposes of determining that usage is in
            compliance with this Agreement and any applicable laws. In addition, we maintain an
            absolute and unconditional right to review and remove Content accessible by or
            transmitted through the Service that, in our sole discretion, we believe is in violation
            of the law, of this Agreement or is unacceptable to us in our sole discretion.
          </p>
          <p>
            3.4 You may be required to register and create an account ("Account") with Quran.com in
            order to use the Mobile Application and certain features of the Service. Information
            gathered through the registration process and information related to your account will
            be subject to this Agreement, as well as to our Privacy Policy. You represent and
            warrant that all information provided by you when creating an Account is true, accurate
            and complete and that you will maintain, at all times, true, accurate and complete
            information related to your Account. You are prohibited from utilizing alter-egos or
            other disguised identities when utilizing the Service. You will promptly update your
            registration to keep it accurate, current and complete. If we issue you a username and
            password, you may not reveal it to anyone else. You may not use anyone else's username
            and/or password or allow anyone else to use your username and password to access the
            Service. You are responsible for maintaining the confidentiality of your Account,
            username and password, and for any charges, damages, liabilities or losses incurred or
            suffered as a result of your failure to do so. We are not liable for any harm caused by
            or related to the theft of your username and/or password, your disclosure of your
            username and/or password, or your authorization to allow another person to access and
            use the Service using your username and/or password. Furthermore, you are solely and
            entirely responsible for any and all activities that occur under your Account including
            any charges incurred relating to the Service. You agree to immediately notify us of any
            unauthorized use of your username, password or Account or any other breach of security.
            We will not be responsible for any loss or damage that may result if you fail to comply
            with these requirements. If you choose a username that, in our sole discretion, is
            obscene, indecent, abusive or which might otherwise subject us to public disparagement
            or scorn, we reserve the right, without prior notice to you, to automatically change
            your username, delete your submissions and/or posts from the Service, deny you access to
            the Service, or any combination of these options.
          </p>
          <p>
            3.5 You are under no obligation to use or continue to use the Service and may
            temporarily or permanently cease use of the Service without notice to Quran.com.
          </p>
          <h2>4. PRIVACY POLICY.</h2>
          <p>
            4.1 Certain personal information and other information provided by you in the use of the
            Service may be stored on your Mobile Device and/or device used to access our websites
            even if such information is not collected by Quran.com. It is your responsibility to
            maintain the security of your Mobile Device or other device (i.e. home computer) from
            unauthorized access.
          </p>
          <p>
            4.2 Use of any personal information or other information about you collected by
            Quran.com through, or in connection with, the Service is subject to our Privacy Policy,
            which Privacy Policy is incorporated into this Agreement by this reference.
          </p>
          <p>
            4.3 The Service is designed for adults of legal age (18 years and over) and access to
            content provided by advertisers or other third parties may not be suitable for children.
            Quran.com does not knowingly collect personal information from children through the
            Service; for questions about our online Privacy Policy for children you can find our
            privacy policy located at https://quran.com/privacy.
          </p>
          <h2>5. INTELLECTUAL PROPERTY NOTICE.</h2>
          <p>
            5.1 You acknowledge and agree that (i) the Service, and any Content, including without
            limitation the design, text, graphics, pictures, video, information, applications,
            software, music, sound, and other files contained therein or related thereto, (ii) the
            source and object code of the Service, (iii) the format, directories, queries,
            algorithms, structure and organization of the Service, and/or accessed using the
            Service, (iv) the Quran.com company names, logos, and all related products and service
            names, design marks and slogans, and (v) any and all copyrights, patents, trademarks,
            trade secrets, publicity rights and other intellectual property rights associated
            therewith (collectively, the "Intellectual Property,"), are the sole property of
            Quran.com, its wholly-owned subsidiaries, affiliates, licensors, suppliers or other
            third parties. Except as expressly and unambiguously provided herein, you do not
            possess, and Quran.com does not grant to you, any express or implied rights (whether by
            implication, estoppel or other legal theory) in or to any Intellectual Property (or the
            unauthorized use of the Intellectual Property) and all such rights are retained by
            Quran.com, its subsidiaries, parent companies, affiliates and/or any third party owner
            of such rights. You acknowledge and agree that you, and not Quran.com or any third party
            mobile device platform or service provider, shall be solely responsible for the
            investigation, defense, settlement and discharge of any intellectual property
            infringement claim or suit, or any other harm or damages resulting from your use of or
            access to the Service.
          </p>
          <h2>6. CONTENT LICENSE FROM YOU.</h2>
          <p>
            6.1 Quran.com may, but is not obligated to, offer interactive features that allow users
            to, among other things, submit or post content ("User Generated Content") or links to
            third party content on areas of the Service accessible and viewable by other users of
            the Service and the public. You represent and agree that all User Generated Content or
            links submitted or posted by you, shall be your sole responsibility, shall not infringe
            or violate the rights of any other party or violate any laws, contribute to or encourage
            infringing or otherwise unlawful conduct, or otherwise be obscene, objectionable or in
            poor taste, and that you have obtained all necessary rights, licenses or clearances. By
            submitting or posting any User Generated Content on, through or in connection with the
            Service, you hereby grant to Quran.com a limited license to use, modify, delete from,
            add to, publicly perform, publicly display, reproduce, and distribute such User
            Generated Content fully-paid and royalty free in all forms and formats of media now know
            or in the future created, including, without limitation, distributing part or all of the
            Service and any User Generated Content included therein. You further agree to a waiver
            of any ''moral rights,'' or any similar rights to any User Generated Content under any
            jurisdiction. You retain any rights that you may have in your User Generated Content
            submitted or posted on through or in connection with the Service, subject to the limited
            license herein. We reserve the right not to post or publish any User Generated Content,
            and to delete, remove or edit any User Generated Content, at any time in its sole
            discretion without notice or liability. Quran.com has the right, but not the obligation,
            to monitor any information and User Generated Content submitted or posted by you or
            otherwise available on the Service, to investigate any reported or apparent violation of
            this Agreement, and to take any action that Quran.com in its sole discretion deems
            appropriate. You acknowledge and agree that any User Generated Content provided by you
            shall be made public. You acknowledge that (i) you have no expectation of privacy in any
            User Generated Content, and (ii) no confidential, fiduciary, contractually implied or
            other relationship is created between you and Quran.com by reason of your transmitting
            User Generated Content to any area of the Service.
          </p>
          <h2>7. THIRD PARTY PROVIDER CONTENT AND SERVICES.</h2>
          <p>
            7.1 Some of the listings, advertisements, promotions, recommendations, advice,
            information, materials, content and services to which you may access by using the
            Service are owned or provided by third parties (collectively "Third Party Content
            Provider"). It is your responsibility to monitor when you have accessed any such content
            or services that is not part of the Service (collectively, the "Third Party Provider
            Content and Service(s)") and we do not undertake any obligation to expressly notify you
            when you are accessing any Third Party Provider Content and Services that are not part
            of the Service. Third Party Provider Content and Services may include, without
            limitation, advertisements, other search and listing services, information and
            referrals, ratings services, geographic location and navigation services, businesses
            which allow you to bid for and/or purchase products or services, and other services of
            general or specific interest.
          </p>
          <p>
            7.2 The Service may also contain hyperlinks and pointers to other sites on the Internet
            that are maintained by a Third Party Content Provider ("Other Sites"). If you use the
            hyperlinks to access these Other Sites, you will leave the Service and your browser will
            be re-directed to the Other Sites. The Other Sites may have their own terms of use and
            privacy policy and those Other Sites may have different practices and requirements than
            the Service. Quran.com may not have knowledge of, and is not responsible for, the
            content, information, services, products or advertisements presented by any Other Site
            which you use at your own risk. Quran.com does not warrant or make any representation
            regarding the legality, accuracy, quality or authenticity of content, information,
            services or products presented by Other Sites. The hyperlinks to Other Sites do not
            constitute an endorsement by Quran.com of any Other Site(s) or resources, or their
            content, information, services or products. The Service is only providing these links to
            you as a convenience. The terms of use and privacy policy of any Other Sites shall apply
            to your access and use of them. Quran.com accepts no responsibility for the content or
            conduct of Other Sites
          </p>
          <p>
            7.3 Quran.com makes no representations whatsoever concerning (1) the information,
            software or other material appearing on, or accessible through, any Third Party Provider
            Content and Services or Other Sites (including without limitation, any advertisement for
            products or services), (2) the performance or operation of any Third Party Provider
            Content and Services or Other Sites (including, without limitation, any transactions
            initiated or conducted through any Third Party Provider Content and Services or Other
            Sites, any taxes associated therewith and any use by third parties of user credit card
            information), (3) any products or services advertised or sold on or through any Third
            Party Provider Content and Services or Other Sites (including, without limitation, the
            quality, safety and legality of such products or services or the sale thereof), or (4)
            the sellers of any products or services advertised or sold on or through any Third Party
            Content Provider Service or Other Sites. Quran.com shall not be responsible or liable,
            directly or indirectly, for any damage or loss caused or alleged to be caused by, or in
            connection with your use of Third Party Provider Content and Services or Other Sites or
            your reliance on any such Third Party Content Provider content, goods or services,
            available on or through any Third Party Provider Content and Services or Other Sites.
          </p>
          <h2>8. CONTENT DISCLAIMER</h2>
          <p>
            8.1 Use of the Service may result in search results and information listings that may
            commingle advertising and sponsored business listings ("Paid Advertising Content") with
            other business listings that are not Paid Advertising Content. Depending on the text of
            user-provided search terms, Paid Advertising Content will be included in a search
            results list intermingled with other search results. We do not undertake to identify
            which content, if any, is Paid Advertising Content, however, you agree and acknowledge
            that results may be displayed in an order or manner which gives priority to Paid
            Advertising Content.
          </p>
          <p>
            8.2 We make no guarantees or endorsements, nor can we be responsible for, any
            information accessible using the Service or included in the Content, including the
            currency, content, quality, copyright compliance or legality of such information, nor
            are we responsible for any resulting loss or damage relating to the use of such
            information. We reserve the right, in our sole discretion and without any obligation, to
            make improvements to, or correct any error or omissions in, any portion of the
            information accessible using the Service. Where appropriate, we will endeavor to update
            information accessed using the Service on a timely basis, but shall not be liable for
            any delay or inaccuracies related to such updates.
          </p>
          <p>
            8.3 Use of the Services may result in the provision of information that some people find
            objectionable, inappropriate, or offensive. We are not responsible for the accuracy,
            relevancy, copyright compliance, legality, completeness, timeliness or decency of
            material contained in any externally linked websites or services.
          </p>
          <p>
            8.4 Quran.com makes no representation that any third party mobile device platform or
            service provider has endorsed the Service, and you should not rely on the availability
            of the Mobile Application by means of any mobile application catalog, storefront, or
            other means of downloading as an endorsement of the Mobile Application, the Service or
            Quran.com generally. In no event shall any third party mobile device platform or service
            provider have any obligation to you whatsoever to furnish any maintenance and support
            services with respect to the Mobile Application.
          </p>
          <h2>9. THIRD PARTY CONTENT POLICY (YOUTUBE, VIMEO, ETC.).</h2>
          <p>
            Please note that with regard to any content made available on or through the Service
            which contains or displays a third party logo (i.e. YouTube, Vimeo, etc.) or which is
            provided via a third party’s player and is hosted on a third party’s servers; Quran.com
            does not have the ability to permanently remove all or any such content from the third
            party’s servers. Therefore, if you have a complaint concerning any video content made
            available on the Service that is provided by a third party, you should contact the third
            party directly in accordance with copyright policies of the third party. If you believe
            that your work is available on the Service via a third party player in a way that
            constitutes copyright infringement, please: (1) contact the third party directly in
            accordance with its copyright policies; and (2) contact Quran.com by sending us notice
            in accordance with Section 15, below
          </p>
          <h2>10. Quran.com DISCLOSURES</h2>
          <p>
            10.1 When it comes to buying products or services when using the internet, it is
            recommended that you always conduct your own investigations. This includes buying any
            products or services offered or sold as part of, or through, the Service.
          </p>
          <p>
            10.2 Unless we have stated otherwise, you should always assume that when products or
            services are made reference to on the Service, they are made because there exists a
            material connection between Quran.com and the providers of the products and services
            displayed. It should be noted that this is not always the case.
          </p>
          <p>
            10.3 Quran.com will always recommend products and services based in part on a good faith
            belief that the supply of such products or services will help you. We have a good faith
            belief, because Quran.com has either tried the products or services prior to making any
            recommendations, or we have researched the products or services based on the supplier’s
            history. The recommendations made by Quran.com about the products or services are honest
            opinions based on facts known to us at the time a product or service is mentioned on the
            Service.
          </p>
          <p>
            10.4 We have conducted all steps possible to verify the testimonials that appear on the
            Service on behalf of Quran.com. They are treated as average user expectations based on
            the information that was available at the time of publishing them. They are not
            exaggerations of user results which we do not entertain in any form. Enquiries have been
            made to confirm their authenticity at all times. If a claim sounds untrue then We regard
            this as such and do not publish this on the Service.
          </p>
          <p>
            10.5 Where extracts have been displayed from third party sources or content has been
            generated and posted by a third party source, these are in no way indicative of any kind
            of verifiable result, opinion, recommendation or otherwise. You are strongly cautioned
            to conduct your own due diligence prior to relying on such sources.
          </p>
          <p>
            10.6 Our aim is to be 100% honest at all times. If, however, you find something
            displayed on the Service, which you do not agree with, then please contact us
            immediately at info@quran.foundation and we will look into it. We reserve the right to
            withdraw the display of any product or service that does not reach our very high levels
            of satisfaction without any prior notice. Honesty and integrity are important to us at
            all times.
          </p>
          <h2>11. WARRANTY DISCLAIMER.</h2>
          <p>
            11.1 Any use of the Mobile Application, the Service, reliance upon any of the Content,
            and any use of the Internet generally shall be at your sole risk. Quran.com disclaims
            any and all responsibility or liability for the accuracy, content, completeness,
            legality, licensure of Third Party Content Providers, reliability, or operability or
            availability of information or the Content accessible by use of the Service.
          </p>
          <p>
            11.2 THE SERVICE (INCLUDING CONTENT AND INFORMATION POSTED AND ACCESSIBLE AS PART
            THEREOF) IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EITHER
            EXPRESS OR IMPLIED OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
            OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. Quran.com
            DISCLAIMS, TO THE FULLEST EXTENT PERMITTED UNDER LAW, ANY WARRANTIES REGARDING THE
            SECURITY, RELIABILITY, TIMELINESS, ACCURACY AND PERFORMANCE OF THE MOBILE APPLICATION,
            OUR WEBSITES, THE SERVICE AND ANY CONTENT. Quran.com DOES NOT WARRANT THAT ANY DEFECTS
            OR ERRORS WILL BE CORRECTED; OR THAT THE MOBILE APPLICATION, OUR WEBSITES, THE SERVICE,
            ANY CONTENT, OR THE INTERNET GENERALLY, IS FREE OF VIRUSES, ERRORS, OTHER HARMFUL
            COMPONENTS, OR WILL BE UNINTERRUPTED.
          </p>
          <p>
            11.3 Quran.com DISCLAIMS, TO THE FULLEST EXTENT PERMITTED UNDER LAW, ANY AND ALL
            WARRANTIES, REPRESENTATIONS AND ENDORSEMENTS, EXPRESS OR IMPLIED, INCLUDING ANY
            WARRANTIES FOR ANY INFORMATION, GOODS, OR SERVICES, OBTAINED THROUGH, ADVERTISED OR
            RECEIVED THROUGH ANY LINKS PROVIDED BY OR THROUGH THE SERVICE; OR REGARDING THE
            SECURITY, RELIABILITY, TIMELINESS, ACCURACY AND PERFORMANCE OF THE MOBILE APPLICATION,
            OUR WEBSITES, THE SERVICE AND ANY CONTENT.
          </p>
          <p>
            11.4 NO ADVICE OR INFORMATION PROVIDED BY Quran.com, ITS AFFILIATES, OR THEIR RESPECTIVE
            EMPLOYEES AND AGENTS SHALL CREATE ANY WARRANTY.
          </p>
          <p>
            11.5 NONE OF Quran.com, ITS AFFILIATES, OR ANY ASSOCIATED MOBILE DEVICE PLATFORM AND
            SERVICE PROVIDERS, MAKE ANY REPRESENTATIONS, WARRANTIES OR GUARANTEES REGARDING (1) THE
            OPERATION OR PERFORMANCE OF THE MOBILE APPLICATION, SERVICE, OR ANY THIRD PARTY PROVIDER
            CONTENT OR SERVICES OR OTHER SITES; (2) THE NATURE, CONTENT OR ACCURACY (EITHER WHEN
            ACCESSED OR AS A RESULT OF THE PASSAGE OF TIME) OF ANY INFORMATION, MATERIAL, APPARATUS
            OR OTHER PROCESS CONTAINED ON, DISTRIBUTED THROUGH, OR LINKED, DOWNLOADED OR ACCESSED
            FROM THE MOBILE APPLICATION OR OUR WEBSITES (INCLUDING WITHOUT LIMITATION, THOSE
            ACCESSED USING THIRD PARTY PROVIDER CONTENT OR SERVICES); (3) ANY PRODUCTS OR SERVICES
            PURCHASED THROUGH USE OF ANY THIRD PARTY PROVIDER CONTENT OR SERVICE OR OTHER SITE, OR
            ANY PRODUCTS OR SERVICES PURCHASED OR OBTAINED AS A RESULT OF AN ADVERTISEMENT OR OTHER
            INFORMATION OR MATERIAL IN CONNECTION WITH ANY MOBILE APPLICATION, WEBSITE; OR (4) THE
            INTERNET GENERALLY.
          </p>
          <p>
            11.6 SOME STATES OR OTHER JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED
            WARRANTIES, SO THE ABOVE EXCLUSIONS MAY NOT APPLY TO YOU. YOU MAY ALSO HAVE OTHER RIGHTS
            THAT VARY FROM STATE TO STATE AND JURISDICTION TO JURISDICTION AND THAT MAY NOT BE
            LIMITED BY THESE TERM, PROVIDED HOWEVER YOU AGREE AND ACKNOWLEDGE THAT TO THE EXTENT
            PERMISSIBLE UNDER APPLICABLE LAW, YOU WAIVE ANY SUCH STATUTORY RIGHTS WITH RESPECT TO
            IMPLIED WARRANTIES.
          </p>
          <p>
            11.7 NEITHER Quran.com, NOR ANY OF ITS ASSOCIATED MOBILE DEVICE PLATFORM AND SERVICE
            PROVIDERS, WARRANTS THAT THE MOBILE APPLICATION WILL BE COMPATIBLE OR INTEROPERABLE WITH
            YOUR MOBILE DEVICE OR ANY OTHER PIECE OF HARDWARE, SOFTWARE, EQUIPMENT OR DEVICE
            INSTALLED ON OR USED IN CONNECTION WITH YOUR MOBILE DEVICE. FURTHERMORE, YOU ACKNOWLEDGE
            THAT COMPATIBILITY AND INTEROPERABILITY PROBLEMS CAN CAUSE THE PERFORMANCE OF YOUR
            MOBILE DEVICE TO DIMINISH OR FAIL COMPLETELY, AND MAY RESULT IN PERMANENT THE DAMAGE TO
            YOUR MOBILE DEVICE, LOSS OF THE DATA LOCATED ON YOUR MOBILE DEVICE, AND CORRUPTION OF
            THE SOFTWARE AND FILES LOCATED ON YOUR MOBILE DEVICE. YOU ACKNOWLEDGE AND AGREE THAT
            Quran.com AND ITS AFFILIATES, PARTNERS, SUPPLIERS, LICENSORS, AND ASSOCIATED MOBILE
            DEVICE PLATFORM AND SERVICE PROVIDERS SHALL HAVE NO LIABILITY TO YOU FOR ANY LOSSES
            SUFFERED RESULTING FROM OR ARISING IN CONNECTION WITH COMPATIBILITY OR INTEROPERABILITY
            PROBLEMS.
          </p>
          <h2>12. LIMITATION OF LIABILITY.</h2>
          <p>
            12.1 IN NO EVENT SHALL Quran.com OR ANY OF ITS ASSOCIATED MOBILE DEVICE PLATFORM AND
            SERVICE PROVIDERS BE LIABLE TO YOUR FOR YOUR USE, MISUSE OR RELIANCE ON THE MOBILE
            APPLICATION, OUR WEBSITES AND THE SERVICE FOR ANY DAMAGES WHATSOEVER, INCLUDING DIRECT,
            SPECIAL, PUNITIVE, INDIRECT, CONSEQUENTIAL OR INCIDENTAL DAMAGES OR DAMAGES FOR LOSS OF
            PROFITS, REVENUE, USE, OR DATA WHETHER BROUGHT IN WARRANTY, CONTRACT, INTELLECTUAL
            PROPERTY INFRINGEMENT, TORT (INCLUDING NEGLIGENCE) OR OTHER THEORY, EVEN IF Quran.com OR
            ANY OF ITS ASSOCIATED MOBILE DEVICE PLATFORM AND SERVICE PROVIDERS ARE AWARE OF OR HAS
            BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE, ARISING OUT OF OR CONNECTED WITH (1) THE
            USE (OR INABILITY TO USE) OR PERFORMANCE OF THE SERVICE, (2) THE CONTENT OR THE INTERNET
            GENERALLY, (3) RELIANCE UPON OR PERFORMANCE OF ANY CONTENT CONTAINED IN OR ACCESSED FROM
            ANY MOBILE APPLICATION OR ANY THIRD PARTY PROVIDER CONTENT OR SERVICES OR OTHER SITES,
            OR (4) ANY PRODUCTS OR SERVICES PURCHASED OR OBTAINED AS A RESULT OF AN ADVERTISEMENT OR
            OTHER INFORMATION OR MATERIAL ACCESSED USING THE MOBILE APPLICATION,OUR WEBSITE OR THE
            SERVICE. NEITHER Quran.com, NOR ANY OF ITS ASSOCIATED MOBILE DEVICE PLATFORM OR SERVICE
            PROVIDERS, ASSUMES ANY LEGAL LIABILITY OR RESPONSIBILITY FOR THE ACCURACY, COMPLETENESS,
            TIMELINESS OR USEFULNESS OF ANY INFORMATION, APPARATUS, PRODUCT OR PROCESS OR OTHER
            MATERIAL ACCESSIBLE FROM THE MOBILE APPLICATION. THE USER OF THE SERVICES ASSUMES ALL
            RESPONSIBILITY AND RISK FOR THE USE OF THE SERVICE GENERALLY.
          </p>
          <p>
            12.2 THE FOREGOING LIMITATIONS SHALL APPLY NOTWITHSTANDING ANY FAILURE OF THE ESSENTIAL
            PURPOSE OF ANY LIMITED REMEDY, OR IF IT IS OTHERWISE DEEMED UNENFORCEABLE, AND TO THE
            FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW. THESE LIMITATIONS AND EXCLUSIONS APPLY
            WITHOUT REGARD TO WHETHER THE DAMAGES ARISE FROM (1) BREACH OF CONTRACT, (2) BREACH OF
            WARRANTY, (3) NEGLIGENCE, OR (4) ANY OTHER CAUSE OF ACTION, TO THE EXTENT SUCH
            EXCLUSIONS AND LIMITATIONS ARE NOT PROHIBITED BY APPLICABLE LAW.
          </p>
          <p>
            12.3 SOME STATES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY OF CONSEQUENTIAL
            OR INCIDENTAL DAMAGES, SO THE ABOVE EXCLUSIONS MAY NOT APPLY TO ALL USERS; IN SUCH
            STATES LIABILITY IS LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.
          </p>
          <p>
            12.4 WITHOUT LIMITING THE GENERALITY OF THE FOREGOING, Quran.com'S AGGREGATE LIABILITY
            TO YOU (WHETHER UNDER CONTRACT, TORT, STATUTE OR OTHERWISE) SHALL NOT EXCEED THE AMOUNT
            OF FIFTY DOLLARS ($50.00).
          </p>
          <h2>13. INDEMNIFICATION.</h2>
          <p>
            13.1 You agree to indemnify and hold Quran.com and, as applicable, our parent,
            subsidiaries, affiliates, partners, officers, directors, agents and employees,
            licensors, suppliers and Third Party Content Providers harmless from any claim or
            demand, including any and all losses, liabilities, claims, demands, damages, costs or
            expenses, causes of action, suits, proceedings, judgments, awards, executions, and
            liens, including reasonable attorneys' fees and costs, whether brought by third parties
            or otherwise, due to or arising out of: (i) your breach of any representation, warranty,
            covenant or obligation set forth in this Agreement (or any other violation of your
            agreement with Quran.com on the basis of this Agreement); (ii) your use or misuse of any
            location information; (iii) any information, User Generated Content or other content
            transmitted, submitted or provided by you through the Service, including your use of the
            Service to provide a link to another website or to upload content or other information
            using the Mobile Application or our websites and, without limitation, our exercise of
            our rights with respect to such information; (iv) your violation of any law, or your
            violation of the rights of a third party, including the infringement by you of any
            intellectual property, and (v) your use of any User Generated or Third Party Provider
            Content and Services.
          </p>
          <p>
            13.2 The foregoing indemnity obligations will survive any termination of this Agreement.
          </p>
          <p>
            13.3 Quran.com reserves the right, at its own expense, to assume the exclusive defense
            and control of any matter subject to indemnification by you, which will not excuse your
            indemnity obligations under this Section. You agree not to settle any matter subject to
            the forgoing indemnification obligations without the express consent and approval of
            Quran.com.
          </p>
          <h2>14. DIGITAL MILLENNIUM COPYRIGHT COMPLAINTS.</h2>
          <p>
            Quran.com respects the copyright rights of others, and we ask user of Service, our
            advertisers and other third parties to do the same. In appropriate circumstances and at
            our discretion, we may remove, suspend, terminate access, or take other appropriate
            action against users or other third parties who infringe or repeatedly infringe the
            copyright rights of others. Therefore, if you reasonably believe that any Content
            accessed using the Mobile Application or Service contain unauthorized reproductions of
            your copyrighted work or otherwise infringe an exclusive copyright right, and you
            reasonably believe it is appropriate to notify us to take any action/and you want us to
            take any action, then, as required under the Digital Millennium Copyright Act (17 U.S.C.
            sec. 512), ("DMCA") you must promptly provide in writing the following information to
            our Designated Agent: (i) a physical or electronic signature of a person authorized to
            act on behalf of the owner of an exclusive right that is allegedly infringed; (ii)
            identification of the copyrighted work claimed to have been infringed, or if multiple
            copyrighted works at a single on-line site are covered by a single notification, a
            representative list of such works at that site; (iii) identification of the material
            that is claimed to be infringing or to be the subject of infringing activity and that is
            to be removed or access to which is to be disabled, and information reasonably
            sufficient to permit us to locate the material; (iv) information reasonably sufficient
            to permit us to contact you, such as an address, telephone number and e mail address;
            (v) statement that you have a good faith belief that the use of the material in the
            manner complained of is not authorized by the copyright owner, its agent or the law; and
            (vi) a statement that the information in the notice is accurate, and under penalty of
            perjury, that you are authorized to act on behalf of the owner of an exclusive right
            that is allegedly infringed.
          </p>
          <p>
            ANY NOTICE THAT DOES NOT COMPLY WITH THE REQUIREMENTS OF TITLE 17, UNITED STATES CODE,
            SECTION 512(C)(3) WILL NOT RECEIVE A RESPONSE. NOTHING IN THIS SECTION 14.1 IS INTENDED
            TO EXPAND OR SUPPLEMENT THE LEGAL RIGHTS, PROCEDURES AND REMEDIES AUTHORIZED AND GRANTED
            UNDER DMCA AND WE DO NOT REPRESENT ANY RELATED UNDERTAKING BY Quran.com NOT OTHERWISE
            EXPRESSLY REQUIRED BY APPLICABLE LAW.
          </p>
          <h2>15. TERMINATION.</h2>
          <p>
            Quran.com may, in its sole and absolute discretion, at any time and for any or no
            reason, suspend or terminate your use of the Service, including without limitation this
            Agreement and the rights afforded to you hereunder with or without prior notice.
            Furthermore, if you fail to comply with any terms and conditions of this Agreement, then
            this Agreement and any rights afforded to you hereunder shall terminate automatically,
            without any notice or other action by Quran.com. Upon the termination, you shall cease
            all use of the Service and/or uninstall the Mobile Application from your Mobile Device.
            Quran.com reserves the right to terminate or disable all or any portion of the Service,
            our websites or of the Mobile Application (via update of the Mobile Application).
          </p>
          <h2>16. REMEDIES AVAILABLE TO US.</h2>
          <p>
            Quran.com reserves the right to seek any and all remedies available at law or in equity
            in connection with your violation of this Agreement.
          </p>
          <h2>17. ASSIGNMENT.</h2>
          <p>
            You may not assign this Agreement or otherwise transfer your use of the Service to any
            other party, in whole or in part; any attempt to do so shall be void.
          </p>
          <h2>18. SEVERANCE.</h2>
          <p>
            If for any reason a court of competent jurisdiction finds any provision of this
            Agreement to be invalid or unenforceable, the provision will be superseded by a valid,
            enforceable provision that most closely matches the intent of the original provision,
            and the remainder of the Agreement will continue in effect and remain fully enforceable.
          </p>
          <h2>19. LIMITED TIME TO BRING CLAIM.</h2>
          <p>
            You acknowledge and agree that it is the intent of both you and Quran.com to limit the
            period of time a claim may be filed, even if the period is shorter than that fixed by
            the statute of limitations. You therefore agree that any cause of action arising out of
            or related to the Service must commence within one (1) year after the cause of action
            accrues, otherwise such cause of action is permanently barred.
          </p>
          <h2>20. MISCELLANEOUS.</h2>
          <p>
            20.1 You are responsible for compliance with applicable laws, regulations and ordinances
            related to your use of the Service. Your compliance with applicable laws is not limited
            to jurisdictions within the United States (including US Federal law) but also the laws,
            regulations and ordinances of any jurisdiction from which you access the Service.
          </p>
          <p>
            20.2 This Agreement will be governed by and construed in accordance with the laws of the
            State of California, without giving effect to its conflict of laws, provisions or your
            actual state or country of residence, and you agree to submit to personal jurisdiction
            in San Francisco County, California. You agree to exclude, in its entirety, the
            application to this Agreement of the United Nations Convention on Contracts for the
            International Sale of Goods.
          </p>
          <p>
            20.3 Except as expressly stated herein, this Agreement constitutes the entire agreement
            between you and Quran.com with respect to your use of the Service, and it supersedes and
            replaces all prior or contemporaneous communications, proposals, understandings or
            agreement, whether electronic, oral or written, between you and Quran.com with respect
            to your use of the Service and/or the subject matter of Agreement.
          </p>
          <p>
            20.4 Except as provided in this Section 20.4, nothing contained in this Agreement is
            intended or shall be construed to confer upon any person (other than the parties hereto)
            any rights, benefits or remedies of any kind or character, or to create any obligations
            or liabilities of a party to any such person. Notwithstanding the foregoing, you
            acknowledge and agree that each of Quran.com's associated mobile device platform and
            service providers are third party beneficiaries to this Agreement, and that, upon your
            acceptance of the terms and conditions of this Agreement, such associated mobile device
            platform and service providers will have the right to enforce this Agreement against you
            in its capacity as a third party beneficiary to this Agreement.
          </p>
          <p>
            20.5 Any waiver of any provision of this Agreement will be effective only if in writing
            and signed by you and Quran.com. Our failure to enforce our rights and remedies
            available to us with respect to your breach of this Agreement shall not constitute a
            waiver of such breach nor of any prior, concurrent, or subsequent breach of the same or
            any other provision of this Agreement.
          </p>
          <p>
            20.6 To be removed from future Quran.com marketing e-mail campaigns, please e-mail
            info@quran.foundation
          </p>
          <h2>21. USAGE RULES, ADDITIONAL OBLIGATIONS/RIGHTS RELATED TO YOUR MOBILE DEVICE. </h2>
          <p>
            Without limitation, your use of the Service through your Mobile Application via your
            Mobile Device is subject to the Usage Rules established by the third party provider of
            your Mobile Device, which may include Palm, Inc., and the Palm® application, Google,
            Inc. and the Android® operating system, Research in Motion Limited and the BlackBerry®
            smartphone application, Apple, Inc. and the iOS operating system or any other third
            party provider. You are responsible for compliance with the applicable provisions of any
            agreement established by the provider of your Mobile Device. Further, you may not imply
            that any User Generated Content is any way sponsored or endorsed by any third party
            provider.
          </p>
          <h2>22. THIRD PARTY SOFTWARE NOTICES.</h2>
          <p>
            Portions of the Mobile Application are provided with notices and open source licenses
            from such communities and third parties that govern the use of those portions, and any
            licenses granted pursuant to this Agreement do not alter any rights and obligations you
            may have under such open source licenses, however, the disclaimer of warranty and
            limitation of liability provisions in this Agreement will apply to all elements of the
            Service.
          </p>
          <h2>23. CHANGES OR MODIFICATIONS</h2>
          <p>
            Quran.com reserves the right to add, delete, change or modify parts of this Agreement at
            our sole discretion and at any time without notice or liability to you. If we do this,
            we will post the changes on this page and will indicate the effective date of the change
            at the bottom of the page. It is important for you to refer to this Agreement from time
            to time to make sure that you are aware of any additions, revisions, or modifications
            that we may have made. Your continued use of the Service constitutes your acceptance of
            the modified Agreement.
          </p>
          <p>Last updated: March 20, 2024</p>
        </div>
      </PageContainer>
    </>
  );
};

export default TermsAndConditionsPage;
