import React from 'react';
import {Container} from 'semantic-ui-react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

// color purple #a333c8

export default (props) => {

    return(
        <Container>
            <Head>

                <script dangerouslySetInnerHTML={{
                                 __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-TM49B83');`,}}></script>

                <link href = "/static/semantic-ui-css/semantic.min.css" rel = "stylesheet" />

                <link rel="icon" type="image/png" sizes="32x32" href="static/images/favicon32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="static/images/favicon.png" />
            </Head>
            <noscript dangerouslySetInnerHTML={{__html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TM49B83"
                                        height="0" width="0" style="display:none;visibility:hidden"></iframe>`,}}></noscript>
            <style jsx global>
            {`
                html, body {background-color: #4169E1ff;}
                .container>form, .container>form>.fields, .container>form>div>div, .container>form>div>div>div, .container>form>.grid {background-color: #4169E1ff;}
                .fields>.field, .fields>.button {background-color: #4169E1ff;}
                .message, .message>.content, .message>.content>p, .message>.content>.header {background-color: #ffffffff;}
                .field>.checkbox{margin-top: 20px !important; margin-bottom: 20px !important; background-color: #4169E1ff;}
                #Terms>.segments>.segments {border: none !important; box-shadow: none !important;}
                #Form {border-radius: .285rem .285rem .285rem .285rem;}
                form>p {margin-bottom: 0 !important;}
                .troubleshoot {text-align: left !important;}
                canvas {border: 1px solid; border-color: #0000001a; border-radius: 2px;}
                .scrollCanvas {overflow:auto;}
                .highlightblue {background-color: #4169E1ff !important;}
                .highlightblue:hover {background-color: #4169E1ff !important;}

                 .tooltip {
                     text-decoration:none;
                     position:relative;
                 }
                 .tooltip span {
                     display:none;
                 }
                 .tooltip:hover span {
                     display:inline;
                     position:fixed;
                     overflow:hidden;
                     z-index: 5;
                 }

            `}
            </style>
            <Header pageID = {props.pageID} toggler = {props.toggler}/>
            {props.children}
            <Container style = {{padding: '20px'}}>
                <Footer />
            </Container>
            <Container style = {{padding: '20px'}}>
            </Container>

        </Container>
    );
};