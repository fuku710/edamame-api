import * as cdk from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as lambda from '@aws-cdk/aws-lambda'
import * as s3 from '@aws-cdk/aws-s3'
import * as acm from '@aws-cdk/aws-certificatemanager'

export class EdamameApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const certificateArn: string = process.env.CERTIFICATE_ARN || ''
    const domainName: string = process.env.DOMAIN_NAME || ''

    const bucket = new s3.Bucket(this, 'EdamameStore', {
      publicReadAccess: true,
    })

    const handler = new lambda.Function(this, 'GetEdamamesHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('resources'),
      handler: 'edamames.main',
      environment: {
        BUCKET: bucket.bucketName,
      },
    })

    bucket.grantReadWrite(handler)

    const api = new apigateway.RestApi(this, 'EdamameApi', {
      restApiName: 'Edamame API',
      description: 'Get edamame photo',
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    })

    const getEdamamesIntegration = new apigateway.LambdaIntegration(handler)

    api.root.addMethod('GET', getEdamamesIntegration)

    const edamameDomainName = new apigateway.DomainName(this, 'EdamameDomain', {
      certificate: acm.Certificate.fromCertificateArn(
        this,
        'Certificate',
        certificateArn
      ),
      domainName: domainName,
      endpointType: apigateway.EndpointType.REGIONAL,
    })

    edamameDomainName.addBasePathMapping(api)
  }
}
