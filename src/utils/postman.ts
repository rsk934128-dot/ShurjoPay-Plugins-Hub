export const POSTMAN_DOCUMENTER_BASE_URL = 'https://documenter.getpostman.com/view/6335853/U16dS8ig';

export interface PostmanConfig {
  environment: 'sandbox' | 'live';
  baseUrl: string;
  username: string;
  password: string;
  prefix: string;
  storeId: number | string;
  clientIp: string;
  currency: 'BDT' | 'USD';
  amount: number;
}

export function generatePostmanCollection(config: PostmanConfig) {
  return {
    info: {
      _postman_id: `shurjopay-v2-${config.environment}-${Date.now()}`,
      name: `shurjoPay V2 Gateway (${config.environment.toUpperCase()})`,
      description: `Auto-generated shurjoPay V2 API Collection with ${config.environment.toUpperCase()} configuration credentials.\n\nBase URL: ${config.baseUrl}\nUsername: ${config.username}\nStore ID: ${config.storeId}\nPrefix: ${config.prefix}`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    variable: [
      {
        key: 'base_url',
        value: config.baseUrl,
        type: 'string',
        description: 'shurjoPay Gateway Base URL (Sandbox or Production Engine)'
      },
      {
        key: 'username',
        value: config.username,
        type: 'string',
        description: 'Merchant Username'
      },
      {
        key: 'password',
        value: config.password,
        type: 'string',
        description: 'Merchant Password'
      },
      {
        key: 'token',
        value: '',
        type: 'string',
        description: 'Bearer Token obtained from /api/get_token (automatically stored by Postman test script)'
      },
      {
        key: 'prefix',
        value: config.prefix,
        type: 'string',
        description: 'Store prefix assigned by shurjoPay'
      },
      {
        key: 'store_id',
        value: String(config.storeId),
        type: 'string',
        description: 'Store ID for merchant'
      },
      {
        key: 'client_ip',
        value: config.clientIp,
        type: 'string',
        description: 'Whitelisted client IP address'
      },
      {
        key: 'sp_order_id',
        value: '',
        type: 'string',
        description: 'shurjoPay Order ID generated from /api/secret-pay (automatically stored for verification)'
      }
    ],
    item: [
      {
        name: '1. Initialize Session & Generate Token',
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                '// Automatically set the Bearer token in collection variables',
                'var jsonData = pm.response.json();',
                'if (jsonData && jsonData.token) {',
                '    pm.collectionVariables.set("token", jsonData.token);',
                '    console.log("shurjoPay Bearer Token auto-saved:", jsonData.token);',
                '}',
                'pm.test("Status code is 200", function () {',
                '    pm.response.to.have.status(200);',
                '});',
                'pm.test("Token returned with 900s expiration", function () {',
                '    pm.expect(jsonData).to.have.property("token");',
                '    pm.expect(jsonData.token_type).to.eql("Bearer");',
                '});'
              ],
              type: 'text/javascript'
            }
          }
        ],
        request: {
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            },
            {
              key: 'Accept',
              value: 'application/json'
            }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                username: '{{username}}',
                password: '{{password}}'
              },
              null,
              2
            )
          },
          url: {
            raw: '{{base_url}}/api/get_token',
            host: ['{{base_url}}'],
            path: ['api', 'get_token']
          },
          description: 'Authenticates merchant credentials and generates a 15-minute Bearer token required for transaction initiation.'
        }
      },
      {
        name: '2. Create Payment Checkout (Secret-Pay)',
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                'var jsonData = pm.response.json();',
                'if (jsonData && jsonData.sp_order_id) {',
                '    pm.collectionVariables.set("sp_order_id", jsonData.sp_order_id);',
                '    console.log("shurjoPay Order ID saved for verification:", jsonData.sp_order_id);',
                '}',
                'pm.test("Checkout URL returned", function () {',
                '    pm.expect(jsonData).to.have.property("checkout_url");',
                '    console.log("Customer Checkout URL:", jsonData.checkout_url);',
                '});'
              ],
              type: 'text/javascript'
            }
          }
        ],
        request: {
          auth: {
            type: 'bearer',
            bearer: [
              {
                key: 'token',
                value: '{{token}}',
                type: 'string'
              }
            ]
          },
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            },
            {
              key: 'Accept',
              value: 'application/json'
            },
            {
              key: 'Authorization',
              value: 'Bearer {{token}}'
            }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                prefix: '{{prefix}}',
                token: '{{token}}',
                return_url: `${config.baseUrl}/response`,
                cancel_url: `${config.baseUrl}/response`,
                store_id: '{{store_id}}',
                amount: config.amount,
                order_id: `sp_${Date.now().toString().slice(-6)}`,
                currency: config.currency,
                customer_name: 'Maharab Kibria',
                customer_address: 'Mohakhali, Dhaka',
                customer_phone: '01766615677',
                customer_city: 'Dhaka',
                client_ip: '{{client_ip}}'
              },
              null,
              2
            )
          },
          url: {
            raw: '{{base_url}}/api/secret-pay',
            host: ['{{base_url}}'],
            path: ['api', 'secret-pay']
          },
          description: 'Generates a customer checkout URL and unique sp_order_id to redirect customer to card/MFS selection page.'
        }
      },
      {
        name: '3. Verify Payment Status',
        event: [
          {
            listen: 'test',
            script: {
              exec: [
                'var jsonData = pm.response.json();',
                'pm.test("Verification response is valid array", function () {',
                '    pm.expect(jsonData).to.be.an("array");',
                '    if (jsonData.length > 0) {',
                '        pm.expect(jsonData[0]).to.have.property("sp_code");',
                '        console.log("Verification Code:", jsonData[0].sp_code, "Message:", jsonData[0].sp_message);',
                '    }',
                '});'
              ],
              type: 'text/javascript'
            }
          }
        ],
        request: {
          auth: {
            type: 'bearer',
            bearer: [
              {
                key: 'token',
                value: '{{token}}',
                type: 'string'
              }
            ]
          },
          method: 'POST',
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            },
            {
              key: 'Accept',
              value: 'application/json'
            },
            {
              key: 'Authorization',
              value: 'Bearer {{token}}'
            }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                order_id: '{{sp_order_id}}'
              },
              null,
              2
            )
          },
          url: {
            raw: '{{base_url}}/api/verification',
            host: ['{{base_url}}'],
            path: ['api', 'verification']
          },
          description: 'Verifies the final bank/MFS transaction status and checks sp_code (1000 = Success).'
        }
      }
    ]
  };
}

export function createPostmanDataUri(collection: object): string {
  const jsonStr = JSON.stringify(collection);
  return `data:application/json;charset=utf-8,${encodeURIComponent(jsonStr)}`;
}

export function downloadPostmanCollectionFile(collection: object, filename = 'shurjopay-postman-collection.json') {
  const jsonStr = JSON.stringify(collection, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
