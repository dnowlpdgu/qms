// Original audit prompts for the quality management system internal audit.
export const basis = 'ISO 9001 quality management system internal audit checklist';
// Each entry: reference, PDCA stage, topic, suggested evidence, individual audit tests.
const clauses = [
['4.1','Plan','Organizational context','Context review, strategic plan, local risk register',[
'Has the organization determined external and internal issues relevant to its purpose and strategic direction that affect its ability to achieve the intended result(s) of the QMS?',
'Has it determined whether climate change is a relevant issue?',
'Does it monitor and review information about the external and internal issues?',
'Are relevant positive and negative factors considered, including external context and internal strategic direction, values, culture, resources, knowledge and performance?']],
['4.2','Plan','Interested parties','Interested-party register, requirements register, legal register, contracts',[
'Has the organization determined which interested parties are relevant to the QMS?',
'Has it determined the relevant requirements of those interested parties and which requirements will be addressed through the QMS?',
'Does it monitor and review information about the interested parties and their relevant requirements, including climate-change-related requirements where relevant?']],
['4.3','Plan','QMS scope','Scope statement, certificate, site process list',[
'Has the organization determined QMS boundaries and applicability to establish its scope?',
'Does the scope determination consider the issues from 4.1, requirements from 4.2, and the organization’s products and services?',
'Does the organization apply all requirements applicable within the determined QMS scope?',
'Does the documented scope state the types of products and services covered and justify every requirement determined not applicable?',
'If conformity is claimed, do any non-applicable requirements avoid affecting the organization’s ability or responsibility to ensure product and service conformity and enhance customer satisfaction?']],
['4.4.1','Plan','QMS processes','Process maps, process measures, ownership matrix',[
'Has the organization established, implemented, maintained and continually improved a QMS, including needed processes and their interactions, in accordance with the requirements of this document?',
'Has it determined the processes needed for the QMS and their application throughout the organization?',
'Has it determined the inputs required and outputs expected from these processes?',
'Has it determined the sequence and interactions of these processes?',
'Has it determined and applied criteria and methods, including monitoring, measurement and related performance indicators, needed for effective operation and control?',
'Has it determined the process resources and ensured their availability?',
'Has it assigned process responsibilities and authorities?',
'Has it addressed risks and opportunities determined in accordance with 6.1?',
'Has it evaluated processes and implemented changes needed to ensure intended results?',
'Has it improved the processes and the QMS?']],
['4.4.2','Plan','Process documentation','Controlled procedures, completed operating records',[
'Is documented information available to the extent necessary to support operation of the organization’s processes?',
'Is documented information available as evidence that processes are being carried out as planned?']],
['5.1.1','Plan','Leadership and accountability','Leadership interviews, policy and objective records, business plans, review records',[
'Does top management ensure that the quality policy and quality objectives are established and compatible with the organization’s strategic direction?',
'Does top management ensure QMS requirements are integrated into the organization’s business processes?',
'Does top management ensure that QMS resources are available?',
'Does top management communicate the importance of effective quality management and conformity to QMS requirements?',
'Does top management ensure the QMS achieves its intended result(s)?',
'Does top management direct and support persons to contribute to QMS effectiveness?',
'Does top management promote continual improvement?',
'Does top management support other relevant roles to demonstrate leadership in their areas of responsibility?',
'Does top management promote quality culture and ethical behaviour?',
'Does top management promote the process approach?',
'Does top management promote risk-based thinking and opportunity-based thinking?',
'Does top management take accountability for QMS effectiveness?']],
['5.1.2','Plan','Customer focus','Contract reviews, statutory and regulatory requirements, risk records, satisfaction results',[
'Does top management ensure customer and applicable statutory and regulatory requirements are determined, understood and consistently met?',
'Does top management ensure risks and opportunities affecting product and service conformity and the ability to enhance customer satisfaction are determined and addressed?',
'Does top management ensure the focus on enhancing customer satisfaction is maintained?']],
['5.2.1','Plan','Establishing the quality policy','Approved policy, organizational context, business strategy',[
'Is the quality policy appropriate to the purpose of the organization?',
'Does the policy provide a framework for setting quality objectives?',
'Does the policy include a commitment to meet applicable requirements?',
'Does the policy include a commitment to continual improvement of the QMS?',
'Does the policy take account of organizational context and support strategic direction?']],
['5.2.2','Plan','Communicating the quality policy','Controlled policy, access records, staff interviews, external communications',[
'Is the quality policy available as documented information?',
'Is the policy communicated within the organization?',
'Is the policy available to interested parties, as appropriate?',
'Is the policy implemented, understood and applied within the organization?']],
['5.3','Plan','Roles and authorities','Organization chart, role profiles, performance reports, change records',[
'Has top management ensured responsibilities and authorities for relevant roles are assigned and communicated within the organization?',
'Has responsibility and authority been assigned for ensuring QMS conformity to the requirements of this document?',
'Has responsibility and authority been assigned for reporting QMS performance to top management?',
'Has responsibility and authority been assigned for ensuring processes deliver their intended results?',
'Has responsibility and authority been assigned for ensuring customer focus is promoted throughout the organization?',
'Has responsibility and authority been assigned for reporting improvement opportunities to top management?',
'Has responsibility and authority been assigned for maintaining QMS integrity, including when QMS changes are planned and implemented?']],
['6.1.1','Plan','Determine risks and opportunities','Risk register, context assessment, process planning',[
'When planning the QMS, does the organization consider the issues from 4.1 and requirements from 4.2?',
'Has it determined risks and opportunities that need to be addressed to assure the QMS can achieve its intended result(s)?',
'Has it determined risks and opportunities to prevent or reduce undesired effects?',
'Has it determined risks and opportunities to achieve continual improvement?',
'Has it determined risks and opportunities to enhance desired effects?']],
['6.1.2','Plan','Actions to address risks','Risk analysis, action plans, process controls, effectiveness reviews',[
'Does the organization determine, analyze and evaluate risks that can undesirably affect its ability to continually and consistently provide conforming products and services and enhance customer satisfaction?',
'Has it planned actions to address the determined risks?',
'Has it planned how to integrate and implement the actions into QMS processes?',
'Has it planned how to evaluate the effectiveness of the actions?',
'Are actions proportionate to the potential impact of risks on intended QMS results?']],
['6.1.3','Plan','Actions to address opportunities','Opportunity assessments, improvement plans, implementation and effectiveness reviews',[
'Does the organization determine, analyze and evaluate opportunities that can desirably affect its ability to continually and consistently provide conforming products and services and enhance customer satisfaction?',
'Has it planned actions to address the determined opportunities?',
'Has it planned how to integrate and implement the actions into QMS processes?',
'Has it planned how to evaluate the effectiveness of the actions?',
'Are opportunity actions appropriate to organizational context and supportive of desired results?']],
['6.2.1','Plan','Quality objectives','Objective register, policy, monitoring records, communications',[
'Are quality objectives established at relevant functions, levels and processes?',
'Are objectives consistent with the quality policy?',
'Are objectives measurable and do they take applicable requirements into account?',
'Are objectives monitored and communicated?',
'Are objectives updated as appropriate and available as documented information?',
'Are objectives relevant to product and service conformity and the ability to enhance customer satisfaction?']],
['6.2.2','Plan','Planning to achieve quality objectives','Action plans, budgets, owner assignments, evaluation records',[
'For each quality objective, has the organization determined what will be done?',
'Has it determined the resources required?',
'Has it determined who will be responsible?',
'Has it determined when it will be completed?',
'Has it determined how results will be evaluated?']],
['6.3','Plan','Planned QMS changes','Change requests, impact assessments, communications, approvals and reviews',[
'When a need for QMS change is determined, is the change carried out in a planned manner?',
'Are the change purpose and potential consequences considered?',
'Is the potential impact on QMS integrity considered?',
'Are the availability of resources and information considered?',
'Is allocation or reallocation of responsibilities and authorities considered?',
'Is communication of the change considered and carried out?',
'Is how change effectiveness will be monitored and evaluated determined?',
'Is how change results will be reviewed determined and carried out?']],
['7.1.1','Do','Resources: general','Resource plans, budgets, capacity reviews, provider records',[
'Does the organization determine and provide resources needed for QMS establishment, implementation, maintenance and continual improvement?',
'Does it consider capabilities of and constraints on existing internal resources?',
'Does it determine what resources must be obtained from external providers?']],
['7.1.2','Do','People','Staffing plans, shift coverage, process ownership records',[
'Does the organization determine and provide the persons necessary for effective QMS implementation and operation and control of its processes?']],
['7.1.3','Do','Infrastructure','Asset register, maintenance records, IT and transportation resources',[
'Does the organization determine, provide and maintain infrastructure necessary for process operation and product and service conformity?',
'As applicable to on-site, remote or combined work, are buildings and utilities, equipment including hardware and software, transportation, and information and communication technology addressed?']],
['7.1.4','Do','Environment for the operation of processes','Workplace observations, environmental controls, staff feedback',[
'Does the organization determine, provide and maintain the environment necessary for process operation and product and service conformity?',
'As relevant, are social conditions (including non-discriminatory, calm and non-confrontational conditions) addressed?',
'As relevant, are psychological conditions (including stress reduction, burnout prevention and emotional protection) addressed?',
'As relevant, are physical conditions (including temperature, heat, humidity, light, airflow, hygiene and noise) addressed?',
'Is the effect of organizational quality culture and ethical behaviour on relevant environmental factors considered?']],
['7.1.5.1','Do','Monitoring and measuring resources','Equipment register, suitability assessments, maintenance history, fitness records',[
'Does the organization determine and provide resources needed for valid and reliable results when monitoring or measurement verifies product and service conformity?',
'Are resources suitable for the specific monitoring and measurement activities?',
'Are resources maintained to ensure continuing fitness for purpose?',
'Is appropriate documented information available as evidence that resources are fit for purpose?']],
['7.1.5.2','Do','Measurement traceability','Calibration certificates, equipment labels, safeguards, out-of-tolerance reviews',[
'When traceability is required or considered essential, is measuring equipment calibrated or verified (or both) at specified intervals or before use against standards traceable to international or national measurement standards?',
'When no such standard exists, is the basis for calibration or verification available as documented information?',
'Is equipment identified so its calibration or verification status can be determined?',
'Is equipment safeguarded from adjustments, damage or deterioration that could invalidate results?',
'When equipment is unfit for its intended purpose, does the organization determine whether previous measurement results were adversely affected and take appropriate action as necessary?']],
['7.1.6','Do','Organizational knowledge','Knowledge bases, handover records, learning and update records',[
'Does the organization determine knowledge necessary for process operation and achievement of intended QMS results?',
'Is this knowledge retained, applied and shared to the extent necessary?',
'When needs and trends change, does the organization consider current knowledge and determine how to acquire or access necessary additional knowledge and updates?']],
['7.2','Do','Competence','Competence matrices, qualifications, observed work, training and effectiveness records',[
'Are necessary competence requirements determined for persons under the organization’s control whose work affects QMS performance?',
'Are these persons competent based on appropriate education, training or experience?',
'Where applicable, are actions taken to acquire necessary competence and their effectiveness evaluated?',
'Is appropriate documented information available as evidence of competence?']],
['7.3','Do','Awareness','Interviews across shifts, induction and communication records',[
'Are persons under the organization’s control aware of the quality policy?',
'Are they aware of their contribution to QMS effectiveness, including benefits of improved performance?',
'Are they aware of the implications of not conforming to QMS requirements?',
'Are they aware of relevant quality objectives?',
'Are they aware of organizational quality culture and ethical behaviour?']],
['7.4','Do','Communication','Communication plans, meeting records, communication responsibility matrix',[
'Has the organization determined internal and external QMS communications, including what will be communicated?',
'Has it determined when to communicate?',
'Has it determined with whom to communicate?',
'Has it determined how to communicate?',
'Has it determined who communicates?']],
['7.5.1','Do','Documented information: general','QMS document register, site record inventory',[
'Does the QMS include documented information required by this document?',
'Does the QMS include documented information the organization determines necessary for effectiveness?',
'Is the extent of documented information appropriate to organizational size and activities, process complexity and interactions, and people’s competence?']],
['7.5.2','Do','Creating and updating documented information','Recent procedure revisions, templates, approvals',[
'When documented information is created or updated, is it appropriately identified and described (for example title, date, author or reference number)?',
'Are appropriate format (for example language, software version or graphics) and media (for example paper or electronic) selected?',
'Is documented information reviewed and approved for suitability and adequacy?']],
['7.5.3.1','Do','Availability and protection','Point-of-use checks, access controls, backup arrangements',[
'Is documented information required by the QMS and this document available and suitable for use where and when needed?',
'Is it adequately protected from loss of confidentiality, improper use or loss of integrity?']],
['7.5.3.2','Do','Document lifecycle controls','Version history, archive rules, external documents, disposition records',[
'As applicable, are distribution, access, retrieval and use addressed?',
'As applicable, are storage and preservation, including preservation of legibility, addressed?',
'As applicable, is control of changes (such as version control) addressed?',
'As applicable, are retention and disposition addressed?',
'Is external-origin documented information determined necessary for QMS planning and operation identified as appropriate and controlled?',
'Is documented information available as evidence of conformity protected from unintended alterations?']],
['8.1','Do','Operational planning and control','Process plans, acceptance criteria, retained records',[
'Are product or service requirements translated into process criteria, acceptance criteria and resource needs?',
'Are controls implemented and documented information retained to show processes ran as planned and outputs meet requirements?',
'Are planned changes controlled, unintended changes reviewed and adverse effects mitigated?',
'Are outsourced processes controlled within operational planning?']],
['8.2.1','Do','Customer communication','Enquiries, complaints, contracts, customer property records',[
'Do communication arrangements cover product or service information, enquiries, contracts, orders and their changes?',
'Are customer feedback and complaints captured and addressed?',
'Are communication arrangements for customer property and relevant contingency actions defined?']],
['8.2.2','Do','Determining requirements','Specifications, legal checks, offer approvals',[
'Are product or service requirements defined, including applicable statutory, regulatory and organizational requirements?',
'Can the organization substantiate the claims made for its products and services?']],
['8.2.3.1','Do','Review before commitment','Contract review samples, capacity checks, discrepancy resolution',[
'Before commitment, are customer requirements, delivery and post-delivery obligations reviewed against capability?',
'Are unstated but necessary intended-use requirements, organizational requirements and legal obligations considered?',
'Are differences from previous requirements resolved and undocumented customer requirements confirmed before acceptance?']],
['8.2.3.2','Do','Review records','Approved quotations, order review records, requirement updates',[
'Are records retained of requirement-review results where applicable?',
'Are records of any new product or service requirements retained?']],
['8.2.4','Do','Requirement changes','Order revisions, specification updates, notifications',[
'When requirements change, are affected documented information and operational instructions updated?',
'Are relevant personnel made aware of changed requirements?']],
['8.3.1','Do','Design and development: applicability','Design responsibilities, scope justification, design process',[
'Has the organization determined whether it has design and development responsibility for the products or services provided?',
'Where applicable, is a design and development process established, implemented and maintained to support subsequent provision?']],
['8.3.2','Do','Design planning','Design plans, milestones, responsibility and interface records',[
'Does planning address design nature, duration, complexity, stages, reviews, verification and validation?',
'Are design responsibilities, internal and external resources and interfaces controlled?',
'Are customer or user involvement, downstream provision needs, expected controls and required records considered?']],
['8.3.3','Do','Design inputs','Input specifications, previous designs, risk and compliance assessments',[
'Do inputs address functional and performance needs, experience from similar designs and applicable legal or regulatory requirements?',
'Are committed standards or codes and potential consequences of failure considered?',
'Are inputs adequate, complete and unambiguous, conflicting inputs resolved and input records retained?']],
['8.3.4','Do','Design controls','Review minutes, verification reports, validation results',[
'Are intended design results defined and reviews performed to evaluate ability to meet requirements?',
'Do verification activities confirm outputs meet inputs, and validation activities confirm suitability for intended use?',
'Are problems identified during reviews, verification or validation acted on and records retained?']],
['8.3.5','Do','Design outputs','Released drawings, service designs, inspection plans',[
'Do design outputs meet input requirements and support subsequent product or service provision?',
'Do outputs specify necessary monitoring, measurement, acceptance criteria and essential safe and proper-use characteristics?',
'Are design output records retained?']],
['8.3.6','Do','Design changes','Change histories, impact reviews, authorization records',[
'Are design changes identified, reviewed and controlled to avoid adverse effects on conformity?',
'Are change records, review results, authorization and necessary prevention actions retained?']],
['8.4.1','Do','External-provider controls','Supplier approvals, performance ratings, re-evaluations',[
'Are controls applied to externally provided processes, products and services, including outsourced processes and direct-to-customer provision?',
'Are evaluation, selection, performance monitoring and re-evaluation criteria based on provider ability to meet requirements?',
'Are records of these activities and necessary follow-up actions retained?']],
['8.4.2','Do','Type and extent of supplier controls','Risk-based supplier controls, receiving inspections, outsourced-process reviews',[
'Do external processes remain under QMS control, with defined controls over providers and their outputs?',
'Does the control approach consider potential conformity impacts and effectiveness of provider controls?',
'Are necessary verification or other activities defined to ensure external outputs meet requirements?']],
['8.4.3','Do','Supplier communication','Purchase orders, quality agreements, supplier instructions',[
'Are requirements checked for adequacy before being communicated to providers?',
'Are output requirements, approvals, methods, processes, equipment, release and competence communicated where applicable?',
'Are provider interactions, performance monitoring, and organization or customer verification at provider premises communicated as applicable?']],
['8.5.1','Do','Controlled production and service','Work instructions, process records, validation, release controls',[
'Are controlled information on characteristics, activities and intended results available at point of work?',
'Are suitable monitoring resources and checks used at appropriate stages against acceptance criteria?',
'Are suitable infrastructure, environment and competent or qualified people in place?',
'Are processes whose outputs cannot be subsequently verified validated and revalidated where needed?',
'Are actions to prevent human error and arrangements for release, delivery and post-delivery activities implemented?']],
['8.5.2','Do','Identification and traceability','Product labels, job status, batch or service records',[
'Are outputs identified as necessary and is inspection or measurement status identifiable throughout provision?',
'Where traceability is required, is unique identification controlled and necessary records retained?']],
['8.5.3','Do','Customer and provider property','Property inventories, inspection records, incident notifications',[
'Is customer or provider property identified, verified, protected and safeguarded while under organizational control?',
'Are loss, damage or unsuitability reported to the owner and records of what occurred retained?']],
['8.5.4','Do','Preservation','Storage conditions, handling, packaging, transport checks',[
'Are outputs preserved during production and service provision to maintain conformity?',
'Where relevant, are handling, contamination control, packaging, storage, transmission, transport and protection effective?']],
['8.5.5','Do','Post-delivery activities','Warranty records, service obligations, recall or support plans',[
'Are applicable post-delivery requirements met?',
'Does the extent of post-delivery activity consider legal requirements, potential undesired consequences, product or service nature, use and lifetime, customer requirements and feedback?']],
['8.5.6','Do','Production and service changes','Process change reviews, authorizations, resulting actions',[
'Are changes to provision reviewed and controlled sufficiently to maintain conformity?',
'Are review results, authorizing persons and necessary actions retained as documented information?']],
['8.6','Do','Release of products and services','Acceptance records, release approvals, delivery records',[
'Are planned checks completed at appropriate stages to verify requirements before release?',
'Are exceptions to planned release arrangements approved by relevant authority and the customer where applicable?',
'Do release records show evidence of meeting acceptance criteria and identify the authorizing person?']],
['8.7.1','Do','Control of nonconforming outputs','Quarantine records, service corrections, concession approvals',[
'Are nonconforming outputs identified and controlled to prevent unintended use or delivery, including issues found after delivery?',
'Are actions appropriate to the nature and effects of the nonconformity, such as correction, containment, return, suspension, notification or authorized concession?',
'Is conformity reverified after correction?']],
['8.7.2','Do','Nonconforming-output records','Nonconformance reports, dispositions, concession records',[
'Do retained records describe the nonconformity and actions taken?',
'Do records include concessions obtained and identify the authority deciding the disposition?']],
['9.1.1','Check','Monitoring and evaluation','Monitoring plans, KPI records, evaluation reports',[
'Are what to monitor or measure, suitable methods, timing and evaluation points determined?',
'Are QMS performance and effectiveness evaluated and appropriate evidence of results retained?']],
['9.1.2','Check','Customer satisfaction','Surveys, reviews, complaints, delivery and repeat-order trends',[
'Is customer perception of meeting needs and expectations monitored?',
'Are methods for obtaining, monitoring and reviewing customer-perception information determined and used?']],
['9.1.3','Check','Analysis and evaluation','Trend reports, provider analysis, risk-action reviews',[
'Are monitoring and measurement data analyzed to evaluate conformity and customer satisfaction?',
'Does evaluation address QMS performance and effectiveness, planning implementation and risk or opportunity action effectiveness?',
'Are external-provider performance and improvement needs evaluated?']],
['9.2.1','Check','Internal audit purpose','Audit reports, site audit schedule, audit criteria',[
'Do internal audits occur at planned intervals to assess conformity to organizational and applicable standard requirements?',
'Do audits assess whether the QMS is effectively implemented and maintained?']],
['9.2.2','Check','Internal audit program','Audit program, auditor competence, finding closure records',[
'Does the program specify frequency, methods, responsibilities, planning and reporting, considering process importance, changes and previous audit results?',
'Are scope and criteria defined for each audit and are auditors objective and impartial?',
'Are results reported to relevant management and are corrections and corrective actions taken without undue delay?',
'Are records of program implementation and audit results retained?']],
['9.3.1','Check','Management review: general','Review calendar, agendas, minutes, strategic reviews',[
'Does top management review the QMS at planned intervals?',
'Does the review evaluate continued suitability, adequacy, effectiveness and alignment with strategic direction?']],
['9.3.2','Check','Management review inputs','Review packs, trend charts, audit and resource reports',[
'Are previous review actions and changes in relevant external and internal issues considered?',
'Do performance trends cover customer satisfaction, feedback, objectives, process performance, conformity, nonconformities, corrective actions, monitoring, audits and external-provider performance?',
'Are resource adequacy, risk and opportunity action effectiveness and improvement opportunities considered?']],
['9.3.3','Check','Management review outputs','Decision logs, action assignments, approved resources',[
'Do review outputs include decisions and actions for improvement, QMS changes and resource needs?',
'Are review results retained as documented information and resulting actions followed through at the site?']],
['10.1','Act','Improvement: general','Improvement portfolio, project records, customer outcomes',[
'Are improvement opportunities selected and implemented to meet customer requirements and enhance satisfaction?',
'Do improvements address products and services including future needs, prevention or reduction of undesired effects, and QMS performance and effectiveness?']],
['10.2.1','Act','Nonconformity and corrective action','Corrective-action files, cause analysis, effectiveness reviews',[
'When a nonconformity or complaint occurs, is it controlled or corrected and are consequences addressed?',
'Is the need to eliminate causes evaluated using review, cause determination and consideration of similar or potential issues elsewhere?',
'Are proportionate actions implemented and their effectiveness reviewed?',
'Are risks and opportunities updated and QMS changes made when necessary?']],
['10.2.2','Act','Corrective-action evidence','Closed action records, verification evidence',[
'Are records retained of the nature of nonconformities and subsequent actions?',
'Are results of corrective actions retained?']],
['10.3','Act','Continual improvement','Improvement trends, management review outputs, effectiveness results',[
'How is the suitability, adequacy and effectiveness of the QMS continually improved?',
'Are analysis and evaluation results and management review outputs used to determine improvement needs and opportunities?']]
];
export const auditSections = clauses.map(([clause,phase,title,evidence,tests])=>({clause,phase,title,items:tests.map((question,index)=>({id:clause+'-'+(index+1),question,evidence}))}));
export const phases=['Plan','Do','Check','Act'];
